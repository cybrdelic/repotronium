# Repotronium - Comprehensive Code Analysis System

A powerful code analysis and documentation system that transforms complex codebases into clear, actionable insights.

## Features

### Phase 1 (Current Implementation)
- **GitHub Integration**: Connect with GitHub to analyze public and private repositories
- **Code Structure Analysis**: Recursively scan repositories to understand code organization
- **Documentation Generation**: Automatically create documentation from code structure 
- **Dependency Visualization**: Interactive graph visualization of code dependencies
- **Code Quality Analysis**: Metrics on complexity, maintainability, and code quality

### Phase 2-4 (Planned)
- **LLM-Enhanced Analysis**: Deep code understanding using AI models
- **Technical Debt Identification**: Find and prioritize issues automatically
- **Strategic Insights**: Get actionable recommendations for architecture improvements
- **Security Vulnerability Detection**: Identify potential security issues
- **API Documentation**: Generate comprehensive API documentation
- **User Documentation**: Create end-user focused guides from code
- **Team Collaboration**: Collaborate on documentation and improvements

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with GitHub provider
- **API Integration**: Octokit (GitHub API)
- **Data Storage**: JSON file-based storage (simple, no database needed)
- **Dependency Analysis**: Built-in analyzer with dependency-cruiser
- **Visualization**: D3.js and React-Force-Graph
- **AI Integration**: OpenAI API for enhanced analysis
- **Markdown Processing**: ReactMarkdown for rendering documentation

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- GitHub OAuth App credentials
- OpenAI API key (optional, for enhanced analysis features like business insights)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/repotronium.git
   cd repotronium
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file based on the provided `.env.local.example`:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_SECRET=generate_a_random_string
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key (optional)
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - Application name: Repotronium (or your preferred name)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
3. Copy the Client ID and generate a Client Secret
4. Add these values to your `.env.local` file

## Implementation Progress

This implementation covers the core Phase 1 requirements from the original specification, including:

- ✅ GitHub OAuth integration
- ✅ Repository browsing and selection
- ✅ Basic code structure analysis
- ✅ Documentation generation
- ✅ Dependency visualization
- ✅ Code quality metrics
- ✅ Strategic recommendations
- ✅ Business insights

Enhanced features available with OpenAI API integration:
- ✅ AI-powered code quality analysis
- ✅ Architecture insights
- ✅ Technical debt detection
- ✅ Business-level insights for stakeholders

## Roadmap for Future Development

Future enhancements will focus on:

- Advanced code analysis with relationship mapping
- Enhanced LLM integration for deeper code understanding
- More sophisticated technical debt identification
- Security vulnerability detection
- API documentation generation
- User documentation generation
- Team collaboration features

## Business Insights Feature

The Business Insights tab provides stakeholder-oriented information about the analyzed repository, including:

- **Executive Summary**: High-level overview of the project's purpose and value
- **Core Value Proposition**: What problem the software solves
- **Key Features & Implementation Status**: Major features with completion status
- **User Flows**: Description of main user journeys through the application
- **Business Benefits & Use Cases**: Specific benefits for different stakeholders
- **Implementation Roadmap**: Current status and future development plans
- **Competitive Advantages**: What makes the project unique
- **Next Steps for Maximum Impact**: Actionable recommendations

This feature requires an OpenAI API key to be configured in your `.env.local` file:

```
OPENAI_API_KEY=your_openai_api_key
```

The business insights are generated using OpenAI's GPT-4 model, analyzing the codebase to extract business-relevant information without requiring direct stakeholder input.

## License

This project is licensed under the MIT License - see the LICENSE file for details.