import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

test("home page renders heading and call to action", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
  expect(screen.getByText(/Report an Issue/)).toBeDefined();
  expect(screen.getByText(/Explore Issues/)).toBeDefined();
});

test("home page renders the navbar", () => {
  render(<Page />);

  expect(screen.getByTestId("navbar")).toBeDefined();
});
