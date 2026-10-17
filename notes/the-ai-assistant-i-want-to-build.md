---
title: "The AI Assistant I Want To Build"
date: 2026-10-17
excerpt: "About a year ago, OpenClaw, the open-source AI agent platform, burst onto the tech scene and spread like wildfire."
tags: [development, ai]
slug: "the-ai-assistant-i-want-to-build"
featured_image: "/assets/images/notes/the-ai-assistant-i-want-to-build.jpg"
featured_image_alt: "Doli AI Assistant at workstation"
featured_image_width: 1200
featured_image_height: 630
send: true
broadcast: false
sent: false
---

# The AI Assistant I Want to Build

About a year ago, OpenClaw, the open-source AI agent platform, burst onto the tech scene and spread like wildfire.

For the first time, AI agents started to feel less like something built exclusively for large companies and more like something ordinary people could actually use, experiment with, and have fun with.

People jumped on the bandwagon and started building all kinds of agents. Agents that read emails, draft replies, call their wives, and do all sorts of cool things.

About a week ago, I found myself looking for a better way to keep track of the things I need to do.

I already use TickTick, one of the best to-do list apps I’ve tried. It’s free and has pretty much every feature I need.

But I wanted something simpler. Something that required less effort to use.

Like most to-do list apps, TickTick requires me to think in the language of the app. Create a task. Set a date. Add a reminder. Find the right screen. Fill in the right fields.

None of that is particularly difficult. But sometimes, it’s just enough friction to make me put off adding something altogether.

And that defeats the purpose.

I kept asking myself: How can I make managing tasks, reminders, and notes so effortless that I actually stick with it?

Then the idea of an AI agent came to mind.

I remembered seeing people interact with their OpenClaw agents through chat apps they already use. I use WhatsApp every day, multiple times a day, to stay connected with friends and family.

What if I could simply talk to an agent on WhatsApp, using natural language, and have it take care of my tasks, keep track of my notes, and remind me of anything I tell it to remember?

No forms. No navigating menus. Just a conversation.

I started exploring the idea almost immediately. But there was one thing I wanted to get right from the beginning: **natural language for interaction, deterministic logic for the underlying system.**

LLMs hallucinate. They can confidently tell you something that isn’t true. That’s not the kind of behaviour you want from a personal assistant you rely on to remember things for you.

So I started thinking about how to build something that feels intelligent without making the system itself unpredictable.

## The Architecture

I wanted a few principles to guide every decision I made.

1. **Chat first.** The interface should be something I already use, not another app I have to remember to open.
2. **The LLM interprets.** It takes my natural language and translates it into structured operations the system can understand.
3. **One source of truth.** I should be able to interact with Doli from different platforms without losing context or ending up with fragmented information.
4. **LLM agnostic.** I should be able to switch model providers without having to redesign the system.

These constraints led me to a deliberately simple architecture.

I needed a state engine that decides what is true, with the LLM handling the conversation around it.

The model interprets my request and proposes a structured operation. The state engine validates that operation, applies the relevant rules, and persists the result.

The model can suggest what should happen. It doesn't get to decide what actually happened.

That distinction is at the heart of the entire system.

## Conversation, State, and Memory

Since every interaction happens through chat, I needed to be deliberate about separating three things that can easily get blurred together: conversation, state, and memory.

**Conversation is what was said. State is what is currently true. Memory is information deliberately retained for later retrieval.**

Consider this example.

I tell Doli:

"I need to call the university tomorrow."

The conversation contains that message.

The state engine can turn it into a task called "Call the university", with a due date.

Now suppose I explicitly tell Doli:

"Remember that I prefer morning meetings."

That becomes a memory the system can retrieve when relevant.

All three might appear in the same conversation, but they serve very different purposes under the hood.

This separation matters because I don't want Doli to depend on a model remembering something simply because it appeared somewhere in an earlier conversation.

Instead, the system retrieves the relevant state or memory and supplies it to the model when needed.

The database remains the source of truth. The model gets the context it needs to respond, without becoming responsible for storing or maintaining that truth itself.

## An AI Assistant... Not Really!

The obvious way to describe Doli is as an AI assistant.

But the term often brings to mind autonomous agents. You decide what they can access and which tools they can use, then let them reason and take actions to accomplish a goal.

That's not quite what I'm building.

I'm using an LLM because it's good at understanding natural language. I can tell Doli:

"I need to call the university tomorrow at 2 and remind me an hour before."

It should understand that I want a task scheduled for tomorrow at 2 PM, with a reminder one hour earlier.

But understanding what I want is different from deciding what is true.

The model interprets the request and proposes a structured operation. The system validates that operation and persists the result.

The boundary is deliberate.

**The LLM interprets. The state engine decides what is true. The database is the source of truth.**

If the model disappears, changes, gets replaced, or produces a different response tomorrow, my tasks and reminders should still exist exactly as they were.

I don't want the reliability of the system to depend on which model happens to be powering it.

So, in a sense, Doli isn't really an AI assistant. It's a persistent state system with a conversational interface.

And that's precisely what I want it to be.

I'm calling the project **Doli**, inspired by dolphins and their remarkable memory.

Let's see how Doli comes together over the next few weeks.