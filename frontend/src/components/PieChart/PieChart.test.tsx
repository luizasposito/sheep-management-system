import { vi } from "vitest";

vi.mock('recharts', async () => {
    const original = await vi.importActual<any>('recharts');
    return {
        ...original,
        ResponsiveContainer: ({ children }: any) => {
        // Garante que children como função seja chamada corretamente
        return (
            <div style={{ width: 400, height: 300 }}>
            {typeof children === 'function'
                ? children({ width: 400, height: 300 })
                : children}
            </div>
        );
        },
    };
});



import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PieChartGraph from "./PieChart";

// Mock globalThis.ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserver;

const sampleData = [
  { name: "A", value: 40 },
  { name: "B", value: 60 },
];

describe("PieChartGraph", () => {
    it("renders a title when provided", () => {
        const titleText = "My Pie Chart";
        render(<PieChartGraph data={sampleData} title={titleText} />);
        const title = screen.queryByText(titleText);
        expect(title).not.toBeNull();
    });

    
    it("renders without title if not provided", () => {
        render(<PieChartGraph data={sampleData} />);
        const heading = screen.queryByRole("heading");
        expect(heading).toBeNull();
    });
});
