import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

test("home page renders heading and call to action", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
  expect(screen.getAllByText(/Report an Issue/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Explore Issues/).length).toBeGreaterThan(0);
});

test("home page renders the navbar", () => {
  render(<Page />);

  expect(screen.getByTestId("navbar")).toBeDefined();
});
