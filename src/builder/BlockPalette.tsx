import type { BlockType } from "../domain/types";

const groups: { title: string; items: BlockType[] }[] = [
  { title: "Layout", items: ["heading", "paragraph", "divider", "page_break", "statement"] },
  {
    title: "Inputs",
    items: [
      "short_text",
      "long_text",
      "email",
      "phone",
      "number",
      "website",
      "single_choice",
      "multiple_choice",
      "dropdown",
      "ranking",
      "rating",
      "opinion_scale",
      "date",
      "time",
      "date_range",
      "matrix",
      "input_table",
      "file_upload",
      "signature",
      "payment",
      "calculated_field",
      "hidden_field"
    ]
  }
];

export function BlockPalette({
  onInsert
}: {
  onInsert: (type: BlockType) => void;
}) {
  return (
    <section className="palette">
      <div className="section-title">Blocks</div>
      {groups.map((group) => (
        <div key={group.title} className="palette-group">
          <div className="palette-group-title">{group.title}</div>
          <div className="palette-items">
            {group.items.map((item) => (
              <button key={item} className="palette-item" type="button" onClick={() => onInsert(item)}>
                <span>{item}</span>
                <span className="palette-plus">+</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
