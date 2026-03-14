# Schema Reuse Prompt Pack (MongoDB MCP + Mongoose)

## How this doc was built

- Source of truth 1: Existing Mongoose model files in this project.
- Source of truth 2: Live MongoDB MCP inspection on database `test` collections `users`, `issues`, `comments`.
- Goal: Reuse the same schema design in a new, similar project.

## Quick-use master prompt

Use this in Copilot/LLM for your new project:

```text
You are building a Node.js + Express + MongoDB backend with Mongoose.
Use MongoDB MCP server for schema validation and alignment.

Task:
1) Create Mongoose models for User, Issue, Comment, and AIPredictionLog.
2) Keep field names, types, constraints, enums, indexes, hooks, and virtuals exactly as specified below.
3) Export each model with CommonJS: module.exports = ModelName.
4) Add timestamps: true for all schemas.
5) Preserve relationships using ObjectId refs where specified.
6) Add indexes exactly as specified.
7) Add pre-save hooks exactly as specified.
8) Keep code clean, production-safe, and compatible with MongoDB Atlas.

After generating models:
- Provide a short migration note if existing collections currently store string IDs instead of ObjectId refs.
- Provide sample seed docs for each model.
- Provide suggested MongoDB MCP checks:
  - list-databases
  - list-collections
  - collection-schema for each target collection
  - find (limit 1-3) for sanity checks

Now generate the model files.
```

## Canonical schema specs (from your current code)

### 1) User model

Collection intent: `users`

```js
{
  clerkUserId: { type: String, required: true, unique: true, trim: true },
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true },
  imageUrl:    { type: String, trim: true },
  role:        { type: String, enum: ["resident", "admin"], default: "resident" },
  isActive:    { type: Boolean, default: true }
}
```

Rules and behavior:

- Index: `{ role: 1 }`.
- Timestamps enabled.

Prompt for generating `User.model.js`:

```text
Create a Mongoose User schema with these fields:
- clerkUserId (String, required, unique, trim)
- fullName (String, required, trim)
- email (String, required, unique, lowercase, trim)
- phone (String, optional, trim)
- imageUrl (String, optional, trim)
- role (String enum: resident/admin, default resident)
- isActive (Boolean, default true)

Add timestamps.
Add index on role.
Add pre-save hook: if role is admin, reject save if another admin exists (_id not equal to current doc).
Export model as User using CommonJS.
```

### 2) Issue model

Collection intent: `issues`

```js
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title:               { type: String, required: true, trim: true },
  description:         { type: String, required: true, trim: true },
  location:            { type: String, trim: true },
  imageUrl:            { type: String, trim: true },
  predictedIssueType:  { type: String, trim: true },
  severityScore:       { type: Number, min: 0, max: 10 },
  suggestedDepartment: {
    type: String,
    enum: ["Electrical", "Plumbing", "Civil", "Housekeeping", "Lift", "Security", "Other"]
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["reported", "approved", "in_progress", "resolved"],
    default: "reported"
  }
}
```

Rules and behavior:

- Virtual `upvoteCount`: `upvotes.length`.
- Virtual `priorityScore`: `(severityScore || 0) + (upvotes.length * 0.5)`.
- Indexes:
  - `{ status: 1 }`
  - `{ severityScore: -1 }`
  - `{ createdAt: -1 }`
- Pre-save hook: if status is `resolved`, `severityScore` must exist.
- Timestamps + virtuals enabled in `toJSON` and `toObject`.

Prompt for generating `Issue.model.js`:

```text
Create a Mongoose Issue schema with:
- user ObjectId ref User (required, indexed)
- title String required trim
- description String required trim
- location String trim
- imageUrl String trim
- predictedIssueType String trim
- severityScore Number min 0 max 10
- suggestedDepartment enum [Electrical, Plumbing, Civil, Housekeeping, Lift, Security, Other]
- upvotes array of ObjectId ref User
- status enum [reported, approved, in_progress, resolved], default reported

Enable timestamps and include virtuals in toJSON/toObject.
Add virtual upvoteCount from upvotes length.
Add virtual priorityScore = (severityScore || 0) + (upvotes.length * 0.5).
Add indexes on status asc, severityScore desc, createdAt desc.
Add pre-save hook: do not allow status resolved when severityScore is null/undefined.
Export model as Issue using CommonJS.
```

### 3) Comment model

Collection intent: `comments`

```js
{
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  commentText: { type: String, required: true, trim: true }
}
```

Rules and behavior:

- Timestamps enabled.
- Indexes on `issue` and `user`.

Prompt for generating `Comment.model.js`:

```text
Create a Mongoose Comment schema with:
- issue ObjectId ref Issue (required, index)
- user ObjectId ref User (required, index)
- commentText String required trim

Enable timestamps.
Export model as Comment using CommonJS.
```

### 4) AIPredictionLog model

Collection intent: `aipredictionlogs`

```js
{
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    required: true,
    unique: true
  },
  modelVersion:       { type: String, required: true, trim: true },
  predictedIssueType: { type: String, trim: true },
  severityScore:      { type: Number, min: 0, max: 10 },
  confidenceScore:    { type: Number, min: 0, max: 1 }
}
```

Rules and behavior:

- One prediction log per issue (`issue` unique).
- Pre-save hook validates confidenceScore is within [0, 1] when provided.
- Timestamps enabled.

Prompt for generating `AIPredictionLog.model.js`:

```text
Create a Mongoose AIPredictionLog schema with:
- issue ObjectId ref Issue (required, unique)
- modelVersion String required trim
- predictedIssueType String trim
- severityScore Number min 0 max 10
- confidenceScore Number min 0 max 1

Enable timestamps.
Add pre-save hook to reject confidenceScore outside 0..1 when not null.
Export model as AIPredictionLog using CommonJS.
```

## Full file generation prompt (drop-in)

```text
Generate these files:
- backend/models/User.model.js
- backend/models/Issue.model.js
- backend/models/Comment.model.js
- backend/models/AIPredictionLog.model.js

Requirements:
- Node.js CommonJS syntax.
- Use mongoose.Schema and mongoose.model.
- Add all required fields, enums, defaults, trim/lowercase, min/max, refs.
- Add all indexes, hooks, and virtuals exactly per specification.
- Include timestamps in each schema.
- Do not use TypeScript.
- Keep code concise and production-ready.

After code generation, also output:
1) Suggested createIndex statements for MongoDB shell.
2) A short migration script outline for converting string IDs to ObjectId refs where needed.
3) MongoDB MCP verification checklist commands and expected checks.
```

## MongoDB MCP verification checklist

Use these MCP steps after creating models in the new project:

1. `list-databases`
2. `list-collections` for your target DB
3. `collection-schema` for `users`, `issues`, `comments`, `aipredictionlogs`
4. `find` with `limit: 1..3` for each collection
5. Validate:
   - ObjectId refs are stored where expected (`issue`, `user`, `upvotes[]`)
   - enum fields only contain allowed values
   - score fields obey numeric ranges
   - timestamps are present

## Important alignment notes from live MCP data in this workspace

Observed from current live DB (`test`):

- `users` includes extra fields not in current Mongoose model: `designation`, `points`.
- `issues` currently shows fields such as `reportedBy`, `coordinates`, `verificationImageUrl`, `verificationStatus`, `verificationUpvotes`, `escalationActive`, `lastReminderSent`, `category`.
- `comments` currently uses `issueId`, `clerkUserId`, `text`, while model expects `issue`, `user`, `commentText`.

If you want exact parity with current runtime data shape, either:

- update Mongoose models to include legacy/runtime fields, or
- run a migration to normalize old documents to the canonical model above.
