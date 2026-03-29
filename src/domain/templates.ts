import { createBlockDefaults, createEmptyFormSchema } from "./defaults";
import { createId } from "../lib/ids";
import type { TemplateDefinition } from "./types";

function withBaseSchema(title: string, description: string): TemplateDefinition {
  const schema = createEmptyFormSchema(title);
  schema.description = description;
  return {
    id: createId("tmpl"),
    title,
    description,
    category: "General",
    schema
  };
}

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  (() => {
    const template = withBaseSchema("Customer Feedback", "A quick satisfaction survey with a rating question.");
    template.category = "Surveys";
    template.schema.blocks = [
      createBlockDefaults("heading", "Customer feedback"),
      createBlockDefaults("paragraph", "Tell us what you think."),
      createBlockDefaults("rating", "How would you rate your experience?"),
      createBlockDefaults("long_text", "What could we do better?")
    ];
    assignTemplateBlocks(template);
    return template;
  })(),
  (() => {
    const template = withBaseSchema("Job Application", "Collect candidate information in a clean multi-step form.");
    template.category = "HR";
    template.schema.blocks = [
      createBlockDefaults("heading", "Join our team"),
      createBlockDefaults("short_text", "Full name"),
      createBlockDefaults("email", "Email address"),
      createBlockDefaults("short_text", "Current role"),
      createBlockDefaults("paragraph", "Upload your resume in the next step.")
    ];
    assignTemplateBlocks(template);
    return template;
  })(),
  (() => {
    const template = withBaseSchema("Event Registration", "Simple registration form for events and meetups.");
    template.category = "Registrations";
    template.schema.blocks = [
      createBlockDefaults("heading", "Event registration"),
      createBlockDefaults("short_text", "Name"),
      createBlockDefaults("email", "Email"),
      createBlockDefaults("dropdown", "Ticket type"),
      createBlockDefaults("statement", "Thanks for registering.")
    ];
    assignTemplateBlocks(template);
    return template;
  })()
];

function assignTemplateBlocks(template: TemplateDefinition): void {
  const pageId = template.schema.pages[0]?.id;
  template.schema.blocks = template.schema.blocks.map((block, index) => ({
    ...block,
    pageId: pageId ?? block.pageId,
    order: index + 1
  }));
}
