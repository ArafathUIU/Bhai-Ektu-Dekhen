import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import EmergencyPage from "@/app/emergency/page";

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMap = () => <div data-testid="map" />;
    return MockMap;
  },
}));

const mockResult = vi.hoisted(() => ({
  police_stations: [
    { name: "Gulshan Police Station", address: "Gulshan Ave", phone: "+880123", latitude: 23.79, longitude: 90.41, distance_km: 1.2 },
  ],
  fire_stations: [
    { name: "Kurmitola Fire Station", address: "Zia Colony Rd", phone: "+880456", latitude: 23.83, longitude: 90.4, distance_km: 2.1 },
  ],
  emergency_numbers: [{ service: "National Emergency Helpline", number: "999" }],
  source: "overpass",
}));

vi.mock("@/lib/api", () => ({
  api: {
    emergencyNearby: vi.fn().mockResolvedValue({ data: mockResult }),
  },
}));

test("emergency page renders quick-dial numbers and stations", async () => {
  render(<EmergencyPage />);

  expect(screen.getByRole("heading", { level: 1, name: /Emergency Services/ })).toBeDefined();
  expect(screen.getByText(/999/)).toBeDefined();

  await waitFor(() => expect(screen.getByText(/Gulshan Police Station/)).toBeDefined());
  expect(screen.getByText(/Kurmitola Fire Station/)).toBeDefined();
  expect(screen.getAllByText("📞 Call").length).toBeGreaterThan(0);
});

test("emergency page renders the map and navbar", async () => {
  render(<EmergencyPage />);

  expect(screen.getByTestId("navbar")).toBeDefined();
  await waitFor(() => expect(screen.getByTestId("map")).toBeDefined());
});