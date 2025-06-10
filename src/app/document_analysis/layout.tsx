import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Analysis",
};

export default function DocumentAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}