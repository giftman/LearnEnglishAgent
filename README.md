# Morty · 英语的平行世界

单人自学站。新概念英语第二册单词线，从 **V73 = Lesson 1「A private conversation」** 开始。每天自己打开，没有推送。

P0 能走完一课四步：听 → 跟读 → 朗读 → 视频。进度写在这台浏览器里。朗读反馈是固定示例，不会打开麦克风，也不会调用模型。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 Vite 打印的本地地址（默认 `http://localhost:5173`）。

```bash
npm test
npm run build
npm run preview
```

`npm run build` 先做类型检查，再把站点打到 `dist/`。

## 页面

| 路径 | 做什么 |
| --- | --- |
| `/` | 今日课、连续天、待复习、外链 |
| `/lesson/v73/listen` | 逐句听。没有 mp3 时按 LRC 时间轴演示高亮 |
| `/lesson/v73/shadow` | 跟读。同一套播放器，当前句循环 |
| `/lesson/v73/read` | 朗读。计时是演示，反馈是写死的示例 |
| `/lesson/v73/video` | 视频占位，链到 B 站 `BV1AK4y1A7Z1` 的 `p=2` |

首页「继续」回到第一个还没点完成的步骤。四步都能直接点进去。点每步底部的主按钮，才会把这一步记成完成。

个人菜单里可以导出 / 导入 `morty-progress.json`，或清空本机进度。

## 进度存在哪

键名：`localStorage["morty.progress.v1"]`。

文档就是一份 JSON，字段对齐以后要同步的形状：`currentLessonId`、`streakDays`、`studyDates`、`lessonsDone`（V 编号）、`steps`、`recordings`、`reviewsPending`。学习日按 `Asia/Shanghai` 切。

以后如果要换到 Cloudflare KV 或 D1，整份文档照搬即可：

- KV：`progress:local`
- D1：一行 `(user_id, document, updated_at)`

`ProgressStore`（`src/store/types.ts`）是给那个远程适配器留的。P0 没有调用它。

完成视频步之后，会排上 Z73 的词 / 译 / 听，到期日分别是次日、+2 天、+4 天。同一天不会叠在一起。P0 没有复习做题页，到期项只显示在首页和「复习」说明里。

## 音频不要提交

课文 mp3 不进 git。约定：

```text
public/assets/audio/nc2/01.A Private Conversation.mp3
public/assets/audio/nc2/01.A Private Conversation.lrc
```

对应的 R2 对象键：

```text
audio/nc2/01.A Private Conversation.mp3
audio/nc2/01.A Private Conversation.lrc
recordings/local/v73/{recordingId}.webm
```

把 mp3 放到上面的本地路径后，播放器会改用真实音频，并按 LRC 时间高亮。不放文件就走演示时钟。

如果音频在公开的 R2 域名上，构建前设置：

```bash
VITE_AUDIO_BASE=https://your-audio-host.example
```

地址会变成 `{VITE_AUDIO_BASE}/audio/nc2/01.A Private Conversation.mp3`。私有桶要在 Worker 里签发短时 URL，不要把密钥写进前端。

Lesson 1 的课文和时间轴在 `src/content/lesson1.lrc`。播放器使用全文，并把 LRC 里拆开的 “A young man…” 合成一句。前 12 句的中文跟绿色静态稿一致。

## 部署到 Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- 环境变量：无。有公开音频域名时再加 `VITE_AUDIO_BASE`

`public/_redirects` 会把未知路径送回 `index.html`，刷新课程页不会 404。

## P0 不做

账号、推送、多用户、真语音识别、真模型、把 96 课 mp3 提交进仓库。
