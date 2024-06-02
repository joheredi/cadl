import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { Scope, ScopeContext } from "../src/framework/components/scope.js";
import { useContext } from "../src/framework/core/context.js";
import { render } from "../src/framework/core/render.js";

describe("Scope component", () => {
  it("provides scope", () => {
    function Test() {
      const currentScope = useContext(ScopeContext);
      assert(currentScope);
      assert.equal(currentScope.name, "test");
      assert.equal(currentScope.parent!.name, "<global>");
    }

    render(
      <EmitOutput>
        <Scope name="test">
          <Test />
        </Scope>
      </EmitOutput>,
      []
    );
  });

  it("sets nested context", () => {
    function Test() {
      const currentScope = useContext(ScopeContext);
      assert(currentScope);
      assert.equal(currentScope.name, "child");
      assert.equal(currentScope.parent!.name, "parent");
    }

    render(
      <EmitOutput>
        <Scope name="parent">
          <Scope name="child">
            <Test />
          </Scope>
        </Scope>
      </EmitOutput>,
      []
    );
  });
});
