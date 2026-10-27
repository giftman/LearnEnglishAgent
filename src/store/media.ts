/**
 * Audio is not committed. Drop a file at:
 *   public/assets/audio/nc2/01.A Private Conversation.mp3
 * The same filename is the R2 object name.
 *
 * R2 keys:
 *   audio/nc2/{file}                         textbook mp3 and lrc
 *   recordings/{userId}/{lessonId}/{id}.webm read-aloud takes
 *
 * Example:
 *   audio/nc2/01.A Private Conversation.mp3
 *   audio/nc2/01.A Private Conversation.lrc
 *   recordings/local/v73/rec-1.webm
 *
 * Set VITE_AUDIO_BASE to a public origin (no trailing slash) to play from R2
 * instead of the local public folder. Sign private buckets in a Worker later;
 * do not put signing keys in the client.
 */
export function r2AudioKey(fileName: string): string {
  return `audio/nc2/${fileName}`;
}

export function r2RecordingKey(userId: string, lessonId: string, recordingId: string): string {
  return `recordings/${userId}/${lessonId}/${recordingId}.webm`;
}

export function resolveAudioUrl(fileName: string, base?: string): string {
  const trimmed = (base ?? import.meta.env.VITE_AUDIO_BASE)?.replace(/\/$/, "");
  if (trimmed) return `${trimmed}/${r2AudioKey(fileName)}`;
  return `/assets/audio/nc2/${encodeURI(fileName)}`;
}

export function bilibiliLessonUrl(bvid: string, page: number): string {
  return `https://www.bilibili.com/video/${bvid}/?p=${page}`;
}
