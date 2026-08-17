import { expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExplorePage from "@/app/explore/page";

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMap = () => <div data-testid="map" />;
    return MockMap;
  },
}));

const mockIssues = vi.hoisted(() => [
  { id: 1, public_id: "BEK-00001", title: "Pothole", latitude: "24.75", longitude: "90.40", severity: "HIGH", status: "REPORTED" },
]);

vi.mock("@/lib/api", () => ({
  api: {
    categories: vi.fn().mockResolvedValue({
      data: {
        categories: [
          { id: 1, name: "Road Damage", slug: "road_damage", description: null },
          { id: 2, name: "Garbage", slug: "garbage", description: null },
        ],
      },
    }),
    issues: vi.fn().mockResolvedValue({ data: { issues: { data: mockIssues } } }),
  },
}));

test("explore page renders issues and filter selects", async () => {
  render(<ExplorePage />);

  expect(screen.getByRole("heading", { level: 1, name: /Explore Issues/ })).toBeDefined();
  await waitFor(() => expect(screen.getByText(/Pothole/)).toBeDefined());
  expect(screen.getByText("Road Damage")).toBeDefined();
  expect(screen.getAllByRole("combobox")).toHaveLength(3);
});

test("changing a filter refetches issues", async () => {
  const { api } = await import("@/lib/api");
  render(<ExplorePage />);

  await waitFor(() => expect(api.issues).toHaveBeenCalled());

  const severitySelect = screen.getAllByRole("combobox")[2];
  fireEvent.change(severitySelect, { target: { value: "CRITICAL" } });

  await waitFor(() =>
    expect(api.issues).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: "CRITICAL" }),
    ),
  );
});