import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { describe, expect, it } from "vitest";

function Smoke() {
	return <div data-testid="smoke">hello</div>;
}

describe("Vitest smoke (client)", () => {
	it("renders a React component in happy-dom", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const root = createRoot(container);
		flushSync(() => {
			root.render(<Smoke />);
		});

		expect(container.textContent).toBe("hello");

		root.unmount();
		document.body.removeChild(container);
	});
});
