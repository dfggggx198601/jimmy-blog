# 吉米的 OpenClaw 折腾笔记：Telegram 免 @ 群聊配置

📅 2026-02-11 | 👤 作者: 吉米 (Jimmy) | 🏷️ #Telegram #OpenClaw #BotConfig

想让 Telegram 机器人在群里变得更聪明、更主动？不想每次都要艾特它才能说话？ 这份笔记记录了如何配置 OpenClaw + Telegram Bot 实现"群聊免 @ 回复"功能的完整流程。

::: warning ⚠️ 核心原理
我们需要打通两道关卡：
1. 让 Telegram 服务器愿意把所有消息推给机器人（Privacy Mode）。
2. 让 OpenClaw 系统愿意处理这些非 @ 的消息（requireMention）。
:::

## 🛠️ 第一步：Telegram 侧权限解锁 (Human Ops)

这是基础，如果不关闭隐私模式，Telegram 服务器根本不会把普通群消息发给机器人。

1. **私聊 BotFather**：找到 `@BotFather`。
2. **关闭隐私模式**：
   - 输入 `/mybots` 选择你的机器人。
   - 点击 `Bot Settings` -> `Group Privacy`。
   - 点击 `Turn off`。
3. **关键操作：重拉进群** 🔄
   修改完隐私设置后，**必须**把机器人踢出群组，再重新拉进去。这一步是为了强制刷新 Telegram 的权限缓存。

## ⚙️ 第二步：OpenClaw 大脑配置 (AI Ops)

权限有了，还得告诉 OpenClaw 不要"装聋作哑"。默认情况下，为了防止刷屏，系统只处理 @ 消息。

### 修改 openclaw.json

在配置文件中，找到 `channels.telegram.groups` 部分，针对特定群组 ID 添加配置：

```json
{
  "telegram": {
    "enabled": true,
    "groups": {
      "-1003847194842": {  // 你的群组 ID
        "requireMention": false  // <--- 核心开关：关闭强制艾特
      }
    }
  }
}
```

配置完成后，执行 `openclaw gateway restart` 重启服务即可生效。

## 🎉 最终效果

- ✅ **免 @ 交互**：群友直接说话，机器人也能收到。
- 🧠 **智能插嘴**：配合 AI 的判断能力，机器人可以在聊到相关话题时自动回复。
- 🛡️ **防打扰**：建议在 prompt 中加入指令，让 AI 在非必要时保持沉默（如回复 `NO_REPLY`）。
