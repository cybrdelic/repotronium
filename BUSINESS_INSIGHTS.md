# Business Insights Feature Guide

## Overview

The Business Insights feature provides stakeholder-friendly analysis of repositories, extracting business-level insights from code to help team members understand:

- Core value proposition and features
- Implementation status
- User flows and benefits
- Recommendations for maximum impact

## Technical Implementation

The feature is implemented across these components:

1. **API Integration** (src/lib/openai.ts)
   - Business document type in `generateDocumentation` function
   - Environment variable handling for API key 
   - Security enhancements for API key access

2. **API Endpoint** (src/pages/api/business-insights.ts)
   - Handles POST requests with repository analysis data
   - Processes analysis through OpenAI
   - Returns formatted business insights

3. **UI Component** (src/components/BusinessInsights.tsx)
   - Displays business insights with section navigation
   - Provides helpful error messages
   - Gracefully handles missing API keys

4. **Repository Page** (src/pages/analyze/[owner]/[repo].tsx)
   - Manages business insights tab and data fetching
   - Implements session storage caching
   - Handles tab switching and data loading

## Security Considerations

1. **API Key Security**
   - API key is never exposed to client-side code
   - Only a feature flag (HAS_OPENAI_API_KEY) is exposed to indicate availability
   - Server-side runtime config is used for secure key handling

2. **Error Handling**
   - Descriptive error messages for missing/invalid API keys
   - Client-side instructions for setting up API key
   - Rate limit and timeout handling

## Configuration

To enable the Business Insights feature:

1. Create a `.env.local` file in the project root with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

2. Restart the development server:
   ```
   npm run dev
   ```

## User Experience

- The feature appears as a "Business Insights" tab in the repository analysis page
- Navigation sidebar allows jumping between sections
- Loading and error states provide clear feedback

## Maintenance

When updating this feature, consider:

1. **API Requirements**
   - Using GPT-4 for best results
   - Token limits (currently set to 2500 max_tokens)
   - OpenAI API version compatibility

2. **Prompt Enhancement**
   - The prompt in `openai.ts` can be enhanced for better insights
   - Business terminology and structure can be adjusted in the prompt

3. **Error Messages**
   - Keep error messages user-friendly and actionable
   - Provide clear setup instructions in error states

4. **Performance**
   - Session storage caching reduces redundant API calls
   - Consider implementing server-side caching for frequent repositories

## Troubleshooting

1. **Missing Insights**
   - Check OpenAI API key configuration in `.env.local`
   - Verify OpenAI API key has sufficient quota/credits
   - Check server logs for detailed error messages

2. **Empty or Short Responses**
   - The API may return incomplete responses
   - Consider adjusting the prompt or max_tokens parameter
   - Check repository size and complexity

3. **NextAuth Errors**
   - These are generally unrelated to business insights functionality
   - Session fetch errors are mitigated with refetch settings in _app.tsx
   - Focus on API-specific errors when troubleshooting

## Future Enhancements

Consider these enhancements for future development:

1. **Local Content Caching**
   - Implement database storage for generated insights
   - Add expiration/refresh mechanism for cached insights

2. **Custom Prompts**
   - Allow users to customize the business insights prompt
   - Add specific focus areas (e.g., market analysis, competitive positioning)

3. **Export Functionality**
   - Add PDF/Word export of business insights
   - Implement branded report templates