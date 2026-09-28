# 180 Lift Studio

Create a polished full-stack SaaS app called "180 LIFT AI Content Studio". Build an end-to-end LinkedIn content agent workspace with the exact workflow: Idea → Research → Angle → Post → Visual → QA → Preview → Approval. Use a premium clean 3-column desktop UI: left Content Brief controls, center artifact workspace tabs (research.md, angle.md, post.md, image-prompt.md, qa.md), right realistic LinkedIn preview, bottom workflow progress. Add dashboard, studio, projects, project detail and settings routes. Enable Supabase/Postgres persistence for projects, briefs, workflow runs/stages, research sources, angles, post versions, visual prompts, QA results and approvals. Make all UI interactions functional, editable, versioned, with loading/error/retry states and no data loss. Full Run must execute every stage in sequence in Demo Mode using realistic deterministic example content; clearly show Demo Mode so mock research is never represented as real. Add stage-by-stage execution and regeneration. Angle stage must create 3 candidate angles and allow selection. Post stage must create 3 hook options, selected hook, editable body, CTA, hashtags, character count and reading time. Visual stage must create an image concept and generation prompt. QA stage must show pass/warning/fail checks with explanations, not a vanity score. Preview must look like LinkedIn and clearly not imply publication. Approval must require human approval; scheduling/publishing must remain disabled until a real integration is configured. Add creator settings and an editable system prompt. Use the supplied reference screenshot's information architecture as inspiration, but improve it into a polished customer-ready SaaS. Seed one demo topic: "Why AI adoption fails when teams buy tools before finding the gaps to improve", audience "Working professionals / program managers", POV "Buying a tool is not adoption", desired action "Map one workflow before buying another tool". Do not invent external research or pretend external APIs succeeded. Structure service interfaces so real AI, web research, image generation and LinkedIn integrations can be connected later. Creator profile default: Subhankar Dey; headline: "Global Program Manager | Program Delivery & Transformation | Cross-Functional Leadership | AI-Enabled Execution | PMP | PSM I | Speaker | Digital Transformation".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://angle-artisan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4e191e12-8c04-4120-a867-1e008f52693e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
