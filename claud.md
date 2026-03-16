1. Claude is an coding assistant tool that interact with LLMS to do task for us
2. Claude allow us to extent and use tool outside of it for example playwright-mcp which allow cloud to open a browser screenshot it and ugrate the style, also allow Claude to interact with the browser
3. When first using claud in a project should use /init to scane entire codebase and creare a claude.md file, we can have 3 level when creating a Claude.md file such as Claude.md (project level), Claude.local.md (local level), ~/.claude/Claude.md (machine level)
4. Claude have plant mode which use for hardest task (Shift + Tabs)
5. Using Esc to interupted claude if needed
6. To Rewind a conversation simple use Esc + Esc
7. use /compact to summarise current contect of chat to move to next session of chat without losing the current context, use /clear if you want to dump all conversation history allowing to start off from scratch
8. You can create your own custom commands inside .claude folder -> after creating (command.md) file restart claude to see it used. You also can use $ARGUMENTS so that whenever you run this custom commands you can pass in a path to a file
9. You can integrate github with claude to create issue and have claude help you with it
10. Hook in Claude have 2 type one is PreToolUse and the other is PostToolUse, add hook by adding it in to settings.json of claude (base on what level you want)
