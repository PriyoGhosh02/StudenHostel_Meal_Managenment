"use client";

import React from "react";
import { useCurrentMonth } from "@/hooks/use-current-month";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function LedgerPage() {
  const { monthName } = useCurrentMonth();
  const { t } = useTranslation();

  const sampleTransactions = [
    { type: "deposit", desc: "Member Deposit — Alex Rahman", amount: "+5,000", date: "2026-08-02", balance: "5,000" },
    { type: "deposit", desc: "Member Deposit — Tanvir Ahmed", amount: "+4,500", date: "2026-08-03", balance: "9,500" },
    { type: "expense", desc: "Cook Salary Payment", amount: "-6,000", date: "2026-08-05", balance: "3,500" },
    { type: "expense", desc: "Weekly Bazaar Shopping", amount: "-4,850", date: "2026-08-08", balance: "-1,350" },
    { type: "deposit", desc: "Member Deposits (Batch of 5)", amount: "+20,000", date: "2026-08-09", balance: "18,650" },
    { type: "expense", desc: "Gas Cylinder Refill", amount: "-1,450", date: "2026-08-10", balance: "17,200" },
  ];

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
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">+৳ 42,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Outflow (Expenses)</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">-৳ 23,377</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-semibold uppercase">Closing Cash Reserve</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">৳ 19,123</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Ledger Book</CardTitle>
          <CardDescription>Chronological audit record of all cash flow</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {sampleTransactions.map((tx, i) => {
                const isCredit = tx.amount.startsWith("+");
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant={isCredit ? "success" : "danger"} size="sm">
                        {tx.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-xs md:text-sm text-slate-900">{tx.desc}</TableCell>
                    <TableCell className={`font-bold text-xs ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                      ৳ {tx.amount}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-900">৳ {tx.balance}</TableCell>
                    <TableCell className="text-xs text-slate-500">{tx.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
