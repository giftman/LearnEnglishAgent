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
| `/lesson/v73/listen` | 逐句听 Lesson 1 英音课文，按 LRC 时间高亮 |
| `/lesson/v73/shadow` | 跟读。同一套课文音频，当前句循环 |
| `/lesson/v73/read` | 朗读计时。反馈按这一课的三处发音来提醒 |
| `/lesson/v73/video` | 打开 B 站 `BV1AK4y1A7Z1` 的 `p=2`，页内仍可播放课文音频 |

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

## 音频

Lesson 1 的英音课文随站点一起提供：

```text
public/assets/audio/nc2/01.A Private Conversation.mp3
```

听和跟读都播放这个文件，并按 `src/content/lesson1.lrc` 的时间高亮。文件加载失败时，播放器停住并写明「课文音频加载失败」，不会再用静音时钟假装在播。

其余课文的 mp3 仍不进 git。对象键约定：

```text
audio/nc2/01.A Private Conversation.mp3
audio/nc2/01.A Private Conversation.lrc
recordings/local/v73/{recordingId}.webm
```

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
