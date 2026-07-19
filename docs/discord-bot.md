# Discord Bot Integration

The UAG portal is mirrored by a Discord bot layer so staff and clients can trigger operations without opening the website.

## Commands

| Command | Action |
|---------|--------|
| `/transfer` | Start an instant bank transfer |
| `/balance` | Check linked bank and fund balances |
| `/stock <symbol>` | Pull a live NER / TSE quote |
| `/legal <request>` | Open a legal / compliance ticket |
| `/property` | List real estate and escrow status |
| `/staff` | Get a role-based dashboard link |

## Roles

- **Admin** — full portal + bot control
- **Banking Officer** — transfers and escrow
- **Legal / Finance** — documents and compliance
- **Investor** — funds and stock exchange views

## Setup

1. Create a Discord application at https://discord.com/developers/applications.
2. Add a bot and enable the `applications.commands` scope.
3. Set `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` in `.env.local`.
4. Point the bot to the UAG REST endpoints for transfers, stocks, tickets, etc.
5. Register slash commands with `npx tsx scripts/register-commands.ts`.
