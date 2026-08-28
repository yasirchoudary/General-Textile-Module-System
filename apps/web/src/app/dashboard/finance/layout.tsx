import { FinanceSubnav } from "@/components/finance/finance-subnav";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <FinanceSubnav />
      {children}
    </div>
  );
}
