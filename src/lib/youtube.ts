/**
 * Helper to generate zero-overhead YouTube search redirect links.
 * E.g., https://www.youtube.com/results?search_query=Collision+Theory+Chemistry+Demonstration
 */
export function getYouTubeRedirectUrl(topic: string, subject: string = "Science"): string {
  const cleanTopic = topic.trim().replace(/\s+/g, '+');
  const cleanSubject = subject.trim().replace(/\s+/g, '+');
  
  // Append educational qualifiers so it redirects to a high-quality demonstration search
  return `https://www.youtube.com/results?search_query=${cleanTopic}+${cleanSubject}+demonstration+educational`;
}

/**
 * Parses any text response to double-check search terms block matches and formats links if necessary.
 */
export function injectYouTubeRedirectLinks(aiText: string, subjectName: string): string {
  const youtubeTagRegex = /\[YOUTUBE_SEARCH:\s*([^\]]+)\]/gi;
  
  return aiText.replace(youtubeTagRegex, (match, topicName) => {
    const url = getYouTubeRedirectUrl(topicName, subjectName);
    return `\n\n📺 **Concept Demonstration Video:** [Watch Demonstration on YouTube](${url}) *(Opens in a new tab)*\n`;
  });
}
