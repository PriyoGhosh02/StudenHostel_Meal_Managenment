"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useHostel } from "@/hooks/use-hostel";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { DepositService } from "@/lib/services/deposit.service";
import { ExpenseService } from "@/lib/services/expense.service";
import { MemberService } from "@/lib/services/member.service";
import { DepositRecord } from "@/types/deposit";
import { ExpenseItem } from "@/types/expense";
import { MemberWithProfile } from "@/types/member";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

interface LedgerTx {
  id: string;
  type: "deposit" | "expense";
  desc: string;
  amount: string;
  rawAmount: number;
  date: string;
  timestamp: number;
  balance?: number;
}

export default function LedgerPage() {
  const { currentHostel, currentMember } = useHostel();
  const { isFirebaseConfigured } = useAuth();
  const { monthName, monthId, currency } = useCurrentMonth();
  const { t, currencySymbol } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [ledgerTxs, setLedgerTxs] = useState<LedgerTx[]>([]);
  const [totalInflow, setTotalInflow] = useState(0);
  const [totalOutflow, setTotalOutflow] = useState(0);

  const fetchLedgerData = useCallback(async () => {
    if (!currentHostel || !monthId) return;

    if (currentMember?.status === "pending") {
      setLedgerTxs([]);
      setTotalInflow(0);
      setTotalOutflow(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const [depList, expList, memList] = await Promise.all([
          DepositService.getDepositsForMonth(currentHostel.id, monthId),
          ExpenseService.getExpensesForMonth(currentHostel.id, monthId),
          MemberService.listMembersWithProfiles(currentHostel.id)
        ]);

        const getMemberName = (userId: string) => {
          const m = memList.find((mem) => mem.uid === userId);
          return m ? m.name : "Member";
        };

        const txs: LedgerTx[] = [];
        let inflowSum = 0;
        let outflowSum = 0;

        // Map deposits (only approved ones affect cash flow)
        depList.filter((d) => d.status === "approved").forEach((d) => {
          inflowSum += d.amount;
          
          let dTime = 0;
          let dDateStr = "";
          if (d.createdAt && 'toDate' in d.createdAt) {
            const dateObj = d.createdAt.toDate();
            dTime = dateObj.getTime();
            dDateStr = dateObj.toISOString().split("T")[0];
          }

          txs.push({
            id: d.id,
            type: "deposit",
            desc: `Member Deposit — ${getMemberName(d.userId)}`,
            amount: `+${d.amount.toLocaleString()}`,
            rawAmount: d.amount,
            date: dDateStr,
            timestamp: dTime,
          });
        });

        // Map expenses
        expList.forEach((e) => {
          outflowSum += e.amount;

          let eTime = 0;
          if (e.createdAt && 'toDate' in e.createdAt) {
            eTime = e.createdAt.toDate().getTime();
          }

          txs.push({
            id: e.id,
            type: "expense",
            desc: `${e.title} - ${e.category.toUpperCase()}`,
            amount: `-${e.amount.toLocaleString()}`,
            rawAmount: -e.amount,
            date: e.date,
            timestamp: eTime,
          });
        });

        // Sort ascending to calculate running balance
        txs.sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return a.timestamp - b.timestamp;
        });

        let running = 0;
        const mappedWithBalance = txs.map((tx) => {
          running += tx.rawAmount;
          return { ...tx, balance: running };
        });

        // Sort descending to show latest first
        mappedWithBalance.sort((a, b) => {
          if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
          }
          return b.timestamp - a.timestamp;
        });

        setLedgerTxs(mappedWithBalance);
        setTotalInflow(inflowSum);
        setTotalOutflow(outflowSum);
      } else {
        setLedgerTxs([]);
        setTotalInflow(0);
        setTotalOutflow(0);
      }
    } catch (error) {
      console.error("Error loading ledger:", error);
      toast.error("Failed to load ledger records");
    } finally {
      setLoading(false);
    }
  }, [currentHostel, monthId, isFirebaseConfigured]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const cashReserve = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("ledger")}
        description={`Immutable double-entry transaction log and fund balances for ${monthName}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Inflow (Deposits)</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              +{currencySymbol} {totalInflow.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Outflow (Expenses)</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              -{currencySymbol} {totalOutflow.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Closing Cash Reserve</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {currencySymbol} {cashReserve.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Ledger Book</CardTitle>
          <CardDescription>Chronological audit record of all cash flow</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading ledger logs...</div>
          ) : ledgerTxs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white">
              No transactions recorded for this month. All values are initially 0.
            </div>
          ) : (
            <Table className="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Running Balance</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerTxs.map((tx) => {
                  const isCredit = tx.type === "deposit";
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Badge variant={isCredit ? "success" : "danger"} size="sm">
                          {tx.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{tx.desc}</TableCell>
                      <TableCell className={`font-bold text-xs ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                        {currencySymbol} {tx.amount}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-900">
                        {currencySymbol} {tx.balance?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{tx.date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
