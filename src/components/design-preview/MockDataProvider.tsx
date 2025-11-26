import { ReactNode, createContext, useContext } from "react";
import * as mockData from "@/lib/mock-data";

interface MockDataContextType {
  beneficiaries: typeof mockData.mockBeneficiaries;
  properties: typeof mockData.mockProperties;
  funds: typeof mockData.mockFunds;
  transactions: typeof mockData.mockTransactions;
  kpis: typeof mockData.mockKPIs;
  requests: typeof mockData.mockRequests;
  documents: typeof mockData.mockDocuments;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const value: MockDataContextType = {
    beneficiaries: mockData.mockBeneficiaries,
    properties: mockData.mockProperties,
    funds: mockData.mockFunds,
    transactions: mockData.mockTransactions,
    kpis: mockData.mockKPIs,
    requests: mockData.mockRequests,
    documents: mockData.mockDocuments,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within MockDataProvider");
  }
  return context;
}
