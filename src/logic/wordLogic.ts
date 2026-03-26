export function checkWordAnswer(answer: string, expected: string) {
  return answer.trim().toLowerCase() === expected.trim().toLowerCase();
}