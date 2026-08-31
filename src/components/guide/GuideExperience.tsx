"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { starterPrompts, type GuideEntityMatch, type GuideMessage, type GuideResponse } from "@/data/guide";
import { LocalGuideProvider } from "@/engine/guide";
import styles from "./GuideExperience.module.css";

const provider = new LocalGuideProvider();

interface GuideExperienceProps {
    initialEntity: GuideEntityMatch | null;
}

function contextualPrompts(entity: GuideEntityMatch) {
    if (entity.kind === "star") return [
        `Tell me about ${entity.name}`,
        `Which constellation contains ${entity.name}?`,
        `How bright is ${entity.name}?`,
    ];
    if (entity.kind === "constellation") return [
        `Tell me about the ${entity.name} constellation`,
        entity.id === "orion" ? "What stars form Orion’s Belt?" : `Show me ${entity.name}`,
        `What should I explore after ${entity.name}?`,
    ];
    return [
        `Tell me about ${entity.name}`,
        `How big is ${entity.name}?`,
        `Where is ${entity.name}?`,
        `What should I explore after ${entity.name}?`,
    ];
}

export function GuideExperience({ initialEntity }: GuideExperienceProps) {
    const [messages, setMessages] = useState<GuideMessage[]>([]);
    const [input, setInput] = useState("");
    const [recentEntity, setRecentEntity] = useState<GuideEntityMatch | undefined>(initialEntity ?? undefined);
    const [recentEntities, setRecentEntities] = useState<readonly GuideEntityMatch[]>(initialEntity ? [initialEntity] : []);
    const [pendingEntities, setPendingEntities] = useState<readonly GuideEntityMatch[]>([]);
    const [isResponding, setIsResponding] = useState(false);
    const sequence = useRef(0);
    const quickPrompts = useMemo(
        () => initialEntity ? contextualPrompts(initialEntity) : starterPrompts.map((prompt) => prompt.label),
        [initialEntity]
    );

    async function sendQuestion(rawQuestion: string) {
        const question = rawQuestion.trim().slice(0, 500);
        if (!question || isResponding) return;
        const userId = `user-${sequence.current++}`;
        setMessages((current) => [...current, { id: userId, role: "user", text: question }]);
        setInput("");
        setIsResponding(true);
        const response = await provider.respond(question, {
            recentEntity,
            recentEntities,
            pendingEntities,
            initialEntity: initialEntity ?? undefined,
        });
        if (response.resolvedEntities && response.resolvedEntities.length > 0) {
            setRecentEntities(response.resolvedEntities);
            setRecentEntity(response.resolvedEntity ?? response.resolvedEntities[0]);
        } else if (response.resolvedEntity) {
            setRecentEntity(response.resolvedEntity);
            setRecentEntities([response.resolvedEntity]);
        }
        if (response.pendingEntities !== undefined) setPendingEntities(response.pendingEntities);
        const guideId = `guide-${sequence.current++}`;
        setMessages((current) => [...current, { id: guideId, role: "guide", text: response.answer, response }]);
        setIsResponding(false);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void sendQuestion(input);
    }

    function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (input.trim()) void sendQuestion(input);
        }
    }

    function resetConversation() {
        setMessages([]);
        setInput("");
        setRecentEntity(initialEntity ?? undefined);
        setRecentEntities(initialEntity ? [initialEntity] : []);
        setPendingEntities([]);
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/"><span aria-hidden="true" /> ASTRA</Link>
                <div className={styles.routeTitle}><i aria-hidden="true" /> AI Space Guide</div>
                <nav aria-label="Guide navigation">
                    <Link href="/star-map">Star Map</Link>
                    <Link href="/sources">Sources</Link>
                    <Link href="/explore" prefetch={false}>Explorer</Link>
                </nav>
            </header>

            <div className={styles.layout}>
                <section className={styles.conversation} aria-labelledby="guide-title">
                    <div className={styles.conversationHeader}>
                        <div>
                            <p>Local knowledge system · No external model</p>
                            <h1 id="guide-title">Ask ASTRA</h1>
                        </div>
                        {messages.length > 0 && <button type="button" onClick={resetConversation}>Clear conversation</button>}
                    </div>

                    {initialEntity && (
                        <div className={styles.contextBanner}>
                            <span>Current context</span>
                            <strong>{initialEntity.name}</strong>
                            <small>{initialEntity.kind === "astronomyObject" ? "ASTRA object" : initialEntity.kind}</small>
                        </div>
                    )}

                    <div className={styles.messages} aria-live="polite" aria-relevant="additions">
                        {messages.length === 0 ? (
                            <div className={styles.welcome}>
                                <p>Explore the universe through ASTRA’s curated astronomy data.</p>
                                <div className={styles.promptGrid}>
                                    {quickPrompts.map((prompt, index) => (
                                        <button key={prompt} type="button" onClick={() => void sendQuestion(prompt)}>
                                            <span>{String(index + 1).padStart(2, "0")}</span>
                                            {prompt}
                                            <i aria-hidden="true">↗</i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : messages.map((message) => (
                            <article key={message.id} className={message.role === "user" ? styles.userMessage : styles.guideMessage}>
                                <div className={styles.messageAuthor}>
                                    <span aria-hidden="true" />
                                    {message.role === "user" ? "You" : "ASTRA Guide"}
                                </div>
                                {message.role === "user"
                                    ? <p>{message.text}</p>
                                    : message.response && <GuideResponseCard response={message.response} onPrompt={sendQuestion} />}
                            </article>
                        ))}
                        {isResponding && <div className={styles.localStatus}>Consulting local ASTRA data…</div>}
                    </div>

                    <form className={styles.composer} onSubmit={submit}>
                        <label htmlFor="guide-input">Ask an astronomy question</label>
                        <div>
                            <textarea
                                id="guide-input"
                                value={input}
                                onChange={(event) => setInput(event.target.value.slice(0, 500))}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Ask about Jupiter, Voyager 1, Orion, cosmic scale…"
                                rows={2}
                                maxLength={500}
                            />
                            <button type="submit" disabled={!input.trim() || isResponding}>Send <span aria-hidden="true">↑</span></button>
                        </div>
                        <p><span>Enter to send · Shift+Enter for a new line</span><span>{input.length}/500</span></p>
                    </form>
                </section>

                <aside className={styles.guideAside} aria-label="Guide capabilities">
                    <div className={styles.systemCard}>
                        <span className={styles.systemLabel}>Guide status</span>
                        <div><i aria-hidden="true" /><strong>Local engine ready</strong></div>
                        <p>Answers are assembled deterministically from ASTRA’s shipped datasets. No question leaves this page.</p>
                    </div>
                    <section>
                        <span className={styles.systemLabel}>Try a direction</span>
                        <ul>
                            {[
                                ["Explore", "Which nebula should I explore?"],
                                ["Compare", "Compare Earth and Jupiter"],
                                ["Missions", "What did Voyager 1 do?"],
                                ["Concepts", "What is a black hole?"],
                                ["Star map", "Which constellation contains Betelgeuse?"],
                            ].map(([label, prompt]) => (
                                <li key={label}><button type="button" onClick={() => void sendQuestion(prompt)}><span>{label}</span><small>{prompt}</small></button></li>
                            ))}
                        </ul>
                    </section>
                    <div className={styles.scopeNote}>
                        <span>Scope boundary</span>
                        <p>If a fact is absent from ASTRA’s curated data, the guide says so rather than filling the gap.</p>
                    </div>
                </aside>
            </div>
        </main>
    );
}

function GuideResponseCard({ response, onPrompt }: { response: GuideResponse; onPrompt: (prompt: string) => Promise<void> }) {
    return (
        <div className={styles.responseCard}>
            <p className={styles.answer}>{response.answer}</p>
            {response.facts && response.facts.length > 0 && (
                <dl className={styles.responseFacts}>
                    {response.facts.map((fact) => <div key={`${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
                </dl>
            )}
            {response.actions && response.actions.length > 0 && (
                <div className={styles.responseActions} aria-label="Related destinations">
                    {response.actions.map((action) => (
                        <Link key={`${action.href}-${action.label}`} href={action.href} prefetch={action.href.startsWith("/explore") ? false : undefined} data-tone={action.tone}>
                            {action.label} <span aria-hidden="true">↗</span>
                        </Link>
                    ))}
                </div>
            )}
            {response.suggestions && response.suggestions.length > 0 && (
                <div className={styles.responseSuggestions}>
                    {response.suggestions.map((suggestion) => <button key={suggestion.prompt} type="button" onClick={() => void onPrompt(suggestion.prompt)}>{suggestion.label}</button>)}
                </div>
            )}
            {response.sources && response.sources.length > 0 && (
                <details className={styles.responseSources}>
                    <summary>Sources <span>{response.sources.length}</span></summary>
                    <ul>{response.sources.map((source) => (
                        <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.label}<small>{source.organization}</small></span><i aria-hidden="true">↗</i></a></li>
                    ))}</ul>
                </details>
            )}
            {response.dataNote && <p className={styles.dataNote}><span aria-hidden="true" /> {response.dataNote}</p>}
        </div>
    );
}
