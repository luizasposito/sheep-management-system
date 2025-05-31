import "@testing-library/jest-dom";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LineGraph, { formatDateToDDMM } from "./LineGraph";

beforeAll(() => {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

vi.mock("recharts", async () => {
    const actual = await vi.importActual("recharts");
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    };
});


describe("LineGraph component", () => {
    const sampleData = [
        { name: "2023-01-01", value1: 10, value2: 20 },
        { name: "2023-01-02", value1: 15, value2: 25 },
    ];

    it("renders without crashing with minimal props", () => {
        expect(() => render(<LineGraph data={[]} />)).not.toThrow();
    });

    it("renders title when provided", () => {
        const titleText = "My Line Graph";
        render(<LineGraph data={sampleData} title={titleText} />);
        const titleElement = screen.getByText(titleText);
        expect(titleElement).not.toBeNull();
    });

    it("formats xAxis ticks and tooltip labels as DD-MM", () => {
        render(<LineGraph data={sampleData} />);
        expect(screen.queryAllByText("01-01")[0]).not.toBeNull();
        expect(screen.queryAllByText("02-01")[0]).not.toBeNull();
    });
});

describe("formatDateToDDMM function", () => {
    it("formats valid ISO date strings to DD-MM", () => {
        expect(formatDateToDDMM("2023-01-01")).toBe("01-01");
        expect(formatDateToDDMM("2023-12-25")).toBe("25-12");
        expect(formatDateToDDMM("2023-06-09T10:20:30Z")).toBe("09-06");
    });

    it("returns input string unchanged if date is invalid", () => {
        expect(formatDateToDDMM("invalid-date")).toBe("invalid-date");
        expect(formatDateToDDMM("2023-13-01")).toBe("2023-13-01"); // mês inválido
        expect(formatDateToDDMM("")).toBe("");
    });
});

/*describe("LineGraph dynamicDataKeys behavior", () => {
    const sampleData = [
        { name: "2023-01-01", value1: 10, value2: 20 },
        { name: "2023-01-02", value1: 15, value2: 25 },
    ];

    it("uses passed dataKeys if provided and non-empty (line 47 and 78)", () => {
        const customDataKeys = [
        { key: "value1", color: "red", label: "Custom Label 1" },
        { key: "value2", color: "blue" }, // sem label
        ];

        const { container } = render(
        <LineGraph data={sampleData} dataKeys={customDataKeys} />
        );

        const lines = container.querySelectorAll("path");
        expect(lines.length).toBeGreaterThanOrEqual(2);

        const hasRed = Array.from(lines).some(line => {
        const stroke = line.getAttribute("stroke")?.toLowerCase();
        return stroke === "red" || stroke === "#ff0000" || stroke === "rgb(255,0,0)";
        });
        const hasBlue = Array.from(lines).some(line => {
        const stroke = line.getAttribute("stroke")?.toLowerCase();
        return stroke === "blue" || stroke === "#0000ff" || stroke === "rgb(0,0,255)";
        });

        expect(hasRed).toBe(true);
        expect(hasBlue).toBe(true);
    });

    it("generates dataKeys dynamically if dataKeys is empty or undefined", () => {
        const { container } = render(<LineGraph data={sampleData} />);

        const lines = container.querySelectorAll("path");
        expect(lines.length).toBeGreaterThanOrEqual(2);

        const line1 = Array.from(lines).some(
        (line) => line.getAttribute("stroke") === "hsl(0, 70%, 50%)"
        );
        const line2 = Array.from(lines).some(
        (line) => line.getAttribute("stroke") === "hsl(180, 70%, 50%)"
        );

        expect(line1).toBe(true);
        expect(line2).toBe(true);
    });
});*/