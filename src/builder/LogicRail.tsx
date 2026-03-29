import type { LogicRule } from "../domain/types";
import { EmptyState } from "../components/EmptyState";

export function LogicRail({
  rules,
  onAddRule,
  onDeleteRule
}: {
  rules: LogicRule[];
  onAddRule: () => void;
  onDeleteRule: (ruleId: string) => void;
}) {
  return (
    <section className="logic-rail">
      <div className="section-title">Logic</div>
      <div className="logic-actions">
        <button className="secondary-btn" type="button" onClick={onAddRule}>
          Add rule
        </button>
      </div>
      {!rules.length ? (
        <EmptyState
          title="No rules yet"
          description="Add a logic rule to conditionally show fields, jump pages, or require answers."
          actions={null}
        />
      ) : (
        rules.map((rule, index) => (
          <div key={rule.id} className="logic-card">
            <div className="logic-title">Rule {index + 1}</div>
            <div className="logic-body">
              {rule.conditions.conditions.length
                ? `If ${rule.conditions.conditions.length} condition${rule.conditions.conditions.length > 1 ? "s" : ""} match, ${rule.action.type.replace(/_/g, " ")}.`
                : "Always active"}
            </div>
            <div className="logic-actions">
              <button className="secondary-btn small" type="button" onClick={() => onDeleteRule(rule.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
