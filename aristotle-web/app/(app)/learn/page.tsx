"use client";
import { useState, useRef, useEffect } from "react";
import { getUser, User } from "@/lib/auth";
import {
  getChatHistory, saveChatHistory, clearChatHistory,
  trackTime, getMistakeSummary,
} from "@/lib/tracking";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message { role: "user" | "assistant"; content: string; }

const TOPICS: Record<string, { label: string; content: string }> = {
  "Machine Learning - Supervised Learning": {
    label: "Machine Learning - Supervised Learning",
    content: `**Supervised Learning**

The model learns from **labelled data** — every training example has an input X and a known output Y. The goal is to learn a function f(X) → Y.

**Two main task types:**
- **Classification** — predict a category (spam/not spam, cat/dog)
- **Regression** — predict a continuous value (house price, temperature)

**Core Algorithms:**
- **Linear Regression** — fits a line to data: ŷ = wX + b
- **Logistic Regression** — outputs probability via sigmoid: σ(wX + b)
- **Decision Trees** — splits data by feature thresholds
- **SVM (Support Vector Machine)** — finds maximum-margin hyperplane
- **k-NN** — classifies by majority vote of k nearest neighbours

**Training Process:**
1. Forward pass: compute prediction ŷ
2. Compute loss: L(y, ŷ) — measures error
3. Backpropagation: compute ∂L/∂w
4. Update: w ← w − η·∂L/∂w (gradient descent)

**Overfitting vs Underfitting:**
- **Underfitting** — model too simple, high bias, poor training accuracy
- **Overfitting** — model memorises training data, fails on new data
- **Fix**: regularisation (L1/L2), dropout, more data, cross-validation`,
  },

  "Machine Learning - Unsupervised Learning": {
    label: "Machine Learning - Unsupervised Learning",
    content: `**Unsupervised Learning**

No labels. The model finds hidden structure in **unlabelled data** on its own.

**Clustering — grouping similar points:**
- **K-Means**: assign points to K centroids, update centroids, repeat
  - Hyperparameter: K (number of clusters)
  - Limitation: assumes spherical clusters, sensitive to outliers
- **DBSCAN**: density-based, finds clusters of arbitrary shape, handles noise
- **Hierarchical**: builds a tree (dendrogram) of merges

**Dimensionality Reduction:**
- **PCA (Principal Component Analysis)** — projects data onto directions of maximum variance. Reduces features while retaining most information.
- **t-SNE** — non-linear, preserves local structure, good for visualisation
- **Autoencoders** — neural network that learns a compressed latent representation

**Use Cases:**
- Customer segmentation
- Anomaly detection (fraud, network intrusion)
- Recommendation systems
- Feature learning for downstream tasks

**Key Insight:**
Unsupervised learning is harder to evaluate — there's no ground truth. Common metrics: silhouette score, inertia (within-cluster sum of squares).`,
  },

  "Deep Learning - Neural Networks": {
    label: "Deep Learning - Neural Networks",
    content: `**Neural Networks & Deep Learning**

A neural network is a stack of **layers** of neurons. Each neuron computes:

\`output = activation(w·x + b)\`

**Architecture:**
- **Input layer** — raw features (pixels, tokens, numbers)
- **Hidden layers** — learned representations (deep = many hidden layers)
- **Output layer** — final prediction (softmax for classification)

**Activation Functions:**
| Function | Formula | Use |
|----------|---------|-----|
| ReLU | max(0, x) | Hidden layers (default) |
| Sigmoid | 1/(1+e⁻ˣ) | Binary output |
| Softmax | eˣᵢ/Σeˣ | Multi-class output |
| Tanh | (eˣ−e⁻ˣ)/(eˣ+e⁻ˣ) | RNNs |

**Training:**
- **Loss function**: Cross-entropy (classification), MSE (regression)
- **Optimiser**: Adam (adaptive learning rate), SGD
- **Backpropagation**: chain rule to compute gradients layer by layer

**Common Architectures:**
- **CNN** — Convolutional Neural Network (images)
- **RNN/LSTM** — sequences, time-series, language
- **Transformer** — attention-based, state-of-the-art for NLP
- **GAN** — Generative Adversarial Network (image generation)`,
  },

  "NLP - Transformers & Attention": {
    label: "NLP - Transformers & Attention",
    content: `**Transformers & Attention Mechanism**

Introduced in *"Attention Is All You Need"* (Vaswani et al., 2017). The Transformer replaced RNNs and is now the foundation of all modern LLMs.

**The Core Idea — Self-Attention:**
Each token attends to every other token in the sequence, producing a weighted context vector.

\`Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V\`

Where:
- **Q** = Query (what am I looking for?)
- **K** = Key (what do I offer?)
- **V** = Value (what do I return?)

**Multi-Head Attention:**
Run attention H times in parallel with different learned projections. Captures different types of relationships simultaneously.

**Transformer Block:**
1. Multi-Head Self-Attention
2. Add & Layer Norm (residual connection)
3. Feed-Forward Network (FFN)
4. Add & Layer Norm

**Famous Models Built on Transformers:**
- **BERT** — Bidirectional, encoder-only, classification tasks
- **GPT** — Decoder-only, autoregressive text generation
- **T5** — Encoder-decoder, text-to-text tasks
- **LLaMA, Mistral, Gemma** — Open-source GPT-style models

**Positional Encoding:**
Transformers have no inherent order. Positional encodings (sinusoidal or learned) inject position information.`,
  },

  "Computer Vision - CNNs": {
    label: "Computer Vision - CNNs",
    content: `**Convolutional Neural Networks (CNNs)**

CNNs exploit the spatial structure of images. Instead of fully connecting every pixel, they apply **learnable filters** that detect local patterns.

**Key Operations:**
- **Convolution**: slide a filter (kernel) over the image → feature map
  - Filter size: 3×3 or 5×5 typically
  - Detects edges, textures, shapes at different scales
- **Pooling**: downsamples feature maps (Max Pool, Avg Pool)
  - Reduces spatial dimensions, builds translation invariance
- **Flatten + FC**: final layers convert to class scores

**Classic Architectures:**
| Model | Year | Key Innovation |
|-------|------|---------------|
| LeNet | 1998 | First CNN for digit recognition |
| AlexNet | 2012 | Deep CNN, ReLU, Dropout |
| VGG | 2014 | Very deep (16-19 layers), 3×3 filters only |
| ResNet | 2015 | Skip connections solve vanishing gradient |
| EfficientNet | 2019 | Compound scaling (width/depth/resolution) |

**Transfer Learning:**
Train on ImageNet (1M images, 1000 classes), then fine-tune on your specific task. Works with as few as 100 examples.

**Modern CV Tasks:**
- Image Classification
- Object Detection (YOLO, Faster R-CNN)
- Semantic Segmentation
- Pose Estimation`,
  },

  "Reinforcement Learning": {
    label: "Reinforcement Learning",
    content: `**Reinforcement Learning (RL)**

An agent learns by **trial and error** — taking actions in an environment to maximise cumulative reward. No labelled data.

**Core Components:**
- **Agent** — the learner/decision maker
- **Environment** — the world the agent interacts with
- **State (S)** — current situation
- **Action (A)** — what the agent can do
- **Reward (R)** — feedback signal (+/-)
- **Policy (π)** — mapping from states to actions

**The RL Loop:**
State → Agent selects Action → Environment returns new State + Reward → Repeat

**Key Algorithms:**
- **Q-Learning** — learns Q(s,a) = expected future reward. Off-policy, model-free.
  - \`Q(s,a) ← Q(s,a) + α[r + γ·maxQ(s',a') − Q(s,a)]\`
- **DQN (Deep Q-Network)** — Q-Learning with neural network. Played Atari games at superhuman level.
- **Policy Gradient (REINFORCE)** — directly optimise the policy
- **PPO (Proximal Policy Optimisation)** — stable policy gradient, used in ChatGPT RLHF
- **Actor-Critic (A3C, SAC)** — combines value function + policy

**Famous Applications:**
- AlphaGo / AlphaZero (board games)
- OpenAI Five (Dota 2)
- ChatGPT fine-tuning via RLHF
- Robotics and autonomous driving`,
  },

  "Generative AI - LLMs": {
    label: "Generative AI - LLMs",
    content: `**Generative AI & Large Language Models**

LLMs are Transformer-based models trained to predict the next token in a sequence. Scaled up to billions of parameters, they exhibit emergent reasoning abilities.

**How LLMs Work:**
1. **Tokenisation** — text split into tokens (subwords)
2. **Embedding** — tokens mapped to high-dimensional vectors
3. **Transformer layers** — self-attention builds contextual representations
4. **Output** — probability distribution over vocabulary → sample next token

**Training:**
- **Pre-training**: self-supervised on trillions of tokens (predict next word)
- **SFT (Supervised Fine-Tuning)**: train on curated instruction-response pairs
- **RLHF**: human feedback ranks responses → reward model → PPO fine-tuning

**Key Concepts:**
- **Context window** — max tokens the model can "see" (4K → 1M tokens)
- **Temperature** — controls randomness of output (0 = deterministic, 1 = creative)
- **Top-p / Top-k** — sampling strategies to control diversity
- **Hallucination** — model confidently generates false information

**Prominent Models:**
| Model | Params | Organisation |
|-------|--------|-------------|
| GPT-4 | ~1.8T (est.) | OpenAI |
| LLaMA 3 | 8B–70B | Meta |
| Gemini | Unknown | Google |
| Claude | Unknown | Anthropic |

**Prompt Engineering:**
Zero-shot → Few-shot → Chain-of-Thought → RAG (Retrieval-Augmented Generation)`,
  },

  "Data Structures - Arrays & Linked Lists": {
    label: "Data Structures - Arrays & Linked Lists",
    content: `**Arrays & Linked Lists**

**Arrays** — contiguous memory, O(1) access by index.
- Static: fixed size; Dynamic (Python list, Java ArrayList): amortised O(1) append via doubling
- Insert/delete middle: O(n) — must shift elements

**Linked Lists** — nodes connected by pointers. No contiguous memory.
- Singly: each node → next
- Doubly: each node ↔ prev/next
- Circular: tail → head

**Key Operations:**
| Operation | Array | Linked List |
|-----------|-------|------------|
| Access by index | O(1) | O(n) |
| Insert at head | O(n) | O(1) |
| Insert at tail | O(1) amortised | O(1) with tail ptr |
| Search | O(n) | O(n) |

**When to use which:**
✓ Array — frequent random access, cache-friendly iteration
✓ Linked List — frequent head/tail insertions, unknown size`,
  },

  "Algorithms - Sorting & Searching": {
    label: "Algorithms - Sorting & Searching",
    content: `**Sorting & Searching Algorithms**

**Comparison Sorts — O(n log n) optimal:**
- **Merge Sort**: divide & conquer, stable, O(n) space
- **Quick Sort**: partition around pivot, O(log n) space, O(n²) worst
- **Heap Sort**: in-place, O(1) extra space, not stable

**Simple Sorts — O(n²):**
- Bubble, Selection, Insertion — good for small or nearly-sorted data

**Non-Comparison Sorts:**
- **Counting Sort**: O(n+k), for integers in known range
- **Radix Sort**: O(d·n), digit by digit

**Searching:**
- **Linear Search**: O(n) — unsorted data
- **Binary Search**: O(log n) — requires sorted array
  \`mid = (lo + hi) // 2\`

**Lower Bound:**
Any comparison-based sort requires Ω(n log n) — proved via decision tree argument.`,
  },

  "OOP - Classes & Inheritance": {
    label: "OOP - Classes & Inheritance",
    content: `**Object-Oriented Programming**

**Four Pillars:**
1. **Encapsulation** — bundle data + methods; hide internals with access modifiers
2. **Abstraction** — expose only what's necessary; hide complexity
3. **Inheritance** — child class reuses parent behaviour (\`class Dog(Animal)\`)
4. **Polymorphism** — same interface, different behaviour (method overriding)

**Key Concepts:**
- \`super()\` — call parent class constructor or method
- **Abstract class** — cannot be instantiated; defines interface for subclasses
- **Interface** — pure contract, all methods abstract, no state
- **Method Overloading** — same name, different parameters (compile-time)
- **Method Overriding** — redefine parent method in child (runtime)

**Design Principles (SOLID):**
- **S** — Single Responsibility: one class, one job
- **O** — Open/Closed: open for extension, closed for modification
- **L** — Liskov Substitution: subclass must be substitutable for parent
- **I** — Interface Segregation: many small interfaces > one large
- **D** — Dependency Inversion: depend on abstractions, not concretions`,
  },

  "Operating Systems - Processes & Threads": {
    label: "Operating Systems - Processes & Threads",
    content: `**Processes & Threads**

**Process** — program in execution. Has: code, data, heap, stack, PCB.
States: New → Ready → Running → Waiting → Terminated

**Thread** — lightweight unit within a process. Shares heap + code; has own stack + registers.

**Process vs Thread:**
| Aspect | Process | Thread |
|--------|---------|--------|
| Memory | Separate address space | Shared heap |
| Creation cost | High (fork) | Low |
| Communication | IPC (pipes, sockets) | Shared memory |
| Crash isolation | Strong | Weak |

**CPU Scheduling Algorithms:**
- **FCFS** — First Come First Served (simple, convoy effect)
- **SJF** — Shortest Job First (optimal avg wait, starvation risk)
- **Round Robin** — time quantum, fair, good for interactive
- **Priority Scheduling** — risk of starvation → solved with aging

**Synchronisation:**
- **Race condition** — outcome depends on execution order
- **Mutex** — binary lock; only owner can unlock
- **Semaphore** — counting; \`wait()\` and \`signal()\`
- **Deadlock** — four conditions: mutual exclusion, hold & wait, no preemption, circular wait`,
  },

  "Computer Networks - TCP/IP": {
    label: "Computer Networks - TCP/IP",
    content: `**Computer Networks & TCP/IP**

**TCP/IP 4-Layer Model:**
1. **Application** — HTTP, DNS, FTP, SMTP (what users interact with)
2. **Transport** — TCP (reliable), UDP (fast/unreliable); ports
3. **Internet** — IP addressing, routing, fragmentation
4. **Network Access** — Ethernet, MAC, physical transmission

**TCP vs UDP:**
| | TCP | UDP |
|-|-----|-----|
| Connection | 3-way handshake | Connectionless |
| Reliability | Guaranteed | Best-effort |
| Order | In-order delivery | Not guaranteed |
| Use case | HTTP, email, SSH | DNS, video, gaming |

**TCP 3-Way Handshake:** SYN → SYN-ACK → ACK

**IP Addressing:**
- IPv4: 32-bit (e.g., 192.168.1.1), ~4.3B addresses
- IPv6: 128-bit, essentially unlimited
- **Subnetting**: 192.168.1.0/24 → 256 addresses, mask 255.255.255.0

**DNS — Domain Name System:**
Resolves hostnames to IP addresses. Hierarchical: root → TLD → authoritative → local cache

**HTTP:** Stateless request-response protocol. Methods: GET, POST, PUT, DELETE. Status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error.`,
  },

  "Database Systems - SQL": {
    label: "Database Systems - SQL",
    content: `**Database Systems & SQL**

**Relational Model:**
Data stored in **tables** (relations). Each row = tuple, each column = attribute.

**ACID Properties** (guarantees for transactions):
- **Atomicity** — all or nothing
- **Consistency** — DB moves from valid state to valid state
- **Isolation** — concurrent transactions don't interfere
- **Durability** — committed data survives crashes

**SQL Basics:**
\`\`\`sql
SELECT name, grade FROM students
WHERE grade > 80
ORDER BY grade DESC
LIMIT 10;
\`\`\`

**Joins:**
- INNER JOIN — matching rows only
- LEFT JOIN — all left rows + matching right
- FULL OUTER JOIN — all rows from both

**Normalisation:**
- **1NF** — atomic values, no repeating groups
- **2NF** — no partial dependency on composite key
- **3NF** — no transitive dependency (A→B→C, remove B→C)

**Indexing:**
B-Tree index: O(log n) lookup vs O(n) full table scan. Trade-off: faster reads, slower writes, more storage.

**NoSQL (non-relational):**
- Document (MongoDB), Key-Value (Redis), Graph (Neo4j), Column-family (Cassandra)`,
  },

  "AI Ethics & Safety": {
    label: "AI Ethics & Safety",
    content: `**AI Ethics & Safety**

As AI systems become more capable, their societal impact demands rigorous ethical consideration.

**Core Ethical Principles:**
- **Fairness** — AI must not discriminate based on race, gender, age, etc.
- **Transparency** — decisions should be explainable (XAI)
- **Privacy** — training data and inference must respect personal data
- **Accountability** — humans must remain responsible for AI decisions
- **Beneficence** — AI should benefit humanity, not harm it

**Bias in AI:**
- **Training data bias** — biased data → biased model (COMPAS recidivism system)
- **Measurement bias** — wrong proxy metrics
- **Feedback loops** — biased predictions create biased future data

**AI Safety:**
- **Alignment problem** — ensuring AI goals align with human values
- **Reward hacking** — AI finds unintended ways to maximise reward
- **Instrumental convergence** — advanced AI may pursue resource acquisition as a sub-goal
- **Existential risk** — Superintelligent AI as a long-term concern (Bostrom, Russell)

**Regulation & Governance:**
- **EU AI Act** — risk-based regulation, bans some uses outright
- **GDPR** — "right to explanation" for automated decisions
- **NIST AI RMF** — risk management framework

**Explainability Methods:**
- LIME — local interpretable model-agnostic explanations
- SHAP — Shapley values for feature attribution
- Attention visualisation for Transformers`,
  },
};

const TOPIC_KEYS = Object.keys(TOPICS);

/* ── Ghost cache: pre-baked Socratic conversations for demo ── */
const GHOST_DEMOS: { title: string; topicKey: string; exchanges: { role: "user" | "assistant"; text: string }[] }[] = [
  {
    title: "Neural Networks",
    topicKey: "Deep Learning - Neural Networks",
    exchanges: [
      { role: "user",      text: "How does a neural network actually learn?" },
      { role: "assistant", text: "Great question. Before I explain, let me ask you something.\n\nImagine you're trying to hit a target blindfolded. Someone tells you 'too far left' after each throw. What would you do on your next throw?" },
      { role: "user",      text: "Move slightly to the right?" },
      { role: "assistant", text: "Exactly — you'd make a *small* adjustment based on the feedback. That's the core idea.\n\nIn a neural network, the 'feedback' is called the **loss** — a number measuring how wrong the prediction was. What do you think the network adjusts based on that loss?" },
      { role: "user",      text: "The weights? The connections between neurons?" },
      { role: "assistant", text: "✓ Correct! The **weights** are adjusted. Now here's the key question: the network has millions of weights — how does it know *which direction* to adjust each one without trying every combination?" },
      { role: "user",      text: "Maybe it calculates the gradient? The slope of the error?" },
      { role: "assistant", text: "✓ Exactly right! That's **gradient descent**. The gradient tells each weight which direction increases the loss — so we move in the *opposite* direction.\n\nThis is computed efficiently using **backpropagation** — the chain rule applied layer by layer.\n\nNow push deeper: why do we use a small **learning rate** instead of just jumping straight to the minimum in one step?" },
      { role: "user",      text: "Because the loss landscape isn't smooth? We might overshoot?" },
      { role: "assistant", text: "✓ Perfect. Overshooting means you'd bounce around and never converge. The learning rate η controls the step size.\n\nNow — what happens if η is *too small*? And what's the name for the problem where the gradient becomes almost zero in early layers?" },
    ],
  },
  {
    title: "Transformers & Attention",
    topicKey: "NLP - Transformers & Attention",
    exchanges: [
      { role: "user",      text: "I don't understand the attention mechanism in transformers" },
      { role: "assistant", text: "Let's build the intuition before the math.\n\nWhen you read the sentence *'The bank by the river flooded'* — how do you know 'bank' means riverbank and not a financial institution?" },
      { role: "user",      text: "Because of the word 'river' nearby — the context" },
      { role: "assistant", text: "Exactly. You *attended* to 'river' to disambiguate 'bank'. That's precisely what self-attention does.\n\nIn the attention formula: `Attention(Q, K, V)` — what do you think Q, K, and V might represent in plain English?" },
      { role: "user",      text: "Maybe Q is what you're looking for, K is what each word offers, V is the actual content?" },
      { role: "assistant", text: "✓ Spot on — Query, Key, Value. The model computes similarity between Q and K to decide *how much* each V contributes.\n\nHere's the formula: `softmax(QKᵀ / √dₖ) · V`\n\nWhy do you think we divide by **√dₖ** before the softmax?" },
      { role: "user",      text: "To stop the dot products from getting too large?" },
      { role: "assistant", text: "✓ Correct! Large dot products push softmax into regions with near-zero gradients — killing learning. The scaling keeps things stable.\n\nFinal question: transformers process all tokens *simultaneously* rather than one by one like RNNs. Why is this both a strength and a problem?" },
    ],
  },
];

const QUICK = [
  "I don't understand this concept",
  "Can you give me a real-world example?",
  "Walk me through this step by step",
  "Test my understanding",
  "What should I know before this topic?",
];

export default function LearnPage() {
  const [user, setUser]           = useState<User | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [topicKey, setTopicKey]   = useState(TOPIC_KEYS[0]);
  const [language, setLanguage]   = useState<"english" | "urdu">("english");
  const [difficulty, setDifficulty] = useState("Standard");
  const [turnCount, setTurnCount]     = useState(0);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [playingDemo, setPlayingDemo] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const demoAbortRef = useRef(false);
  // Always-current refs so closures in effects can read latest values
  const messagesRef  = useRef<Message[]>([]);
  const topicKeyRef  = useRef(TOPIC_KEYS[0]);

  // Keep refs in sync with state
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { topicKeyRef.current = topicKey; }, [topicKey]);

  // Mount: load history for initial topic. Unmount: save current history.
  useEffect(() => {
    setUser(getUser());
    const hist = getChatHistory(TOPIC_KEYS[0]);
    if (hist.length > 0) setMessages(hist);

    return () => {
      const msgs = messagesRef.current;
      if (msgs.some(m => m.content.trim())) {
        saveChatHistory(topicKeyRef.current, msgs);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track 1 min of study time every minute (exclude demo playback)
  useEffect(() => {
    if (playingDemo) return;
    const id = setInterval(() => trackTime(1, topicKeyRef.current), 60_000);
    return () => clearInterval(id);
  }, [playingDemo]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const topic = TOPICS[topicKey];

  function changeTopic(newKey: string) {
    // Save current chat before switching topics
    const current = messagesRef.current;
    if (current.some(m => m.content.trim())) {
      saveChatHistory(topicKey, current);
    }
    // Load the new topic's chat history
    const hist = getChatHistory(newKey);
    setMessages(hist);
    setTurnCount(0);
    setTopicKey(newKey);
  }

  async function playDemo(demoIndex: number) {
    const demo = GHOST_DEMOS[demoIndex];
    setShowDemoMenu(false);
    setPlayingDemo(true);
    demoAbortRef.current = false;
    setMessages([]);
    setTurnCount(0);
    setTopicKey(demo.topicKey);

    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    let turns = 0;
    for (const exchange of demo.exchanges) {
      if (demoAbortRef.current) break;

      if (exchange.role === "user") {
        await delay(600);
        if (demoAbortRef.current) break;
        setMessages(prev => [...prev, { role: "user", content: exchange.text }]);
        await delay(400);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        turns++;
        const chars = exchange.text.split("");
        for (const ch of chars) {
          if (demoAbortRef.current) break;
          await delay(18);
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + ch };
            return copy;
          });
        }
        setTurnCount(turns);
        await delay(900);
      }
    }
    setPlayingDemo(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const history = messages.filter(m => m.content);
    setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const mistakeSummary = getMistakeSummary(topic.label);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history, subject: topic.label, language, mistakeSummary }),
        signal: ctrl.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { token } = JSON.parse(data);
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + token };
              return copy;
            });
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Connection error. Please try again." };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      // Save chat after exchange completes (slight delay so state has settled)
      setTimeout(() => {
        if (messagesRef.current.some(m => m.content.trim())) {
          saveChatHistory(topicKeyRef.current, messagesRef.current);
        }
      }, 200);
      setTurnCount(t => {
        const next = t + 1;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content) {
            const lower = last.content.toLowerCase();
            const confirmed = /\b(correct|exactly right|well done|great job|that'?s it|perfect|you got it|spot on|brilliant|yes[,!])\b/.test(lower);
            if (confirmed) {
              setAchievement(`✓ You reached the answer in ${next} guided question${next === 1 ? "" : "s"}!`);
              setTimeout(() => setAchievement(null), 4000);
            }
          }
          return prev;
        });
        return next;
      });
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2540] shrink-0">
        <div>
          <h1 className="text-base font-bold text-white">Study</h1>
          <p className="text-[#8899b0] text-xs">Your personalized study session</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-[#0c1a2e] rounded-lg p-1 border border-[#1a2540]">
            {(["english", "urdu"] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${language === l ? "bg-[#2563eb] text-white" : "text-[#8899b0] hover:text-white"}`}>
                {l === "english" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
            className="border border-[#1a2540] text-[#e2e8f0] text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer" style={{ background: "#0c1a2e" }}>
            {["Beginner", "Standard", "Advanced"].map(d => <option key={d}>{d}</option>)}
          </select>
          {turnCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a54] text-xs text-[#8899b0]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="text-[#3b82f6] font-bold">{turnCount}</span>
              <span>turn{turnCount === 1 ? "" : "s"}</span>
            </div>
          )}

          {/* demo button */}
          <div className="relative">
            <button onClick={() => setShowDemoMenu(m => !m)} disabled={playingDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a54] text-xs text-[#8899b0] hover:text-white hover:border-[#4a5568] disabled:opacity-50 transition-all">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {playingDemo ? "Playing…" : "Example"}
            </button>
            {showDemoMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-[#2a3a54] overflow-hidden z-50 shadow-xl"
                style={{ background: "#0c1a2e" }}>
                {GHOST_DEMOS.map((d, i) => (
                  <button key={i} onClick={() => playDemo(i)}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#c8d3e0] hover:bg-[#1a2540] hover:text-white transition-colors border-b border-[#1a2540] last:border-0">
                    <div className="font-semibold">{d.title}</div>
                    <div className="text-[#4a5568] mt-0.5">{d.exchanges.length} exchanges</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => {
            demoAbortRef.current = true;
            setPlayingDemo(false);
            clearChatHistory(topicKey);
            setMessages([]);
            setTurnCount(0);
            setAchievement(null);
            abortRef.current?.abort();
          }}
            className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold transition-colors">
            New Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* left: content panel */}
        <div className="w-[55%] flex flex-col border-r border-[#1a2540] overflow-hidden">
          {/* topic selector */}
          <div className="px-5 py-3 border-b border-[#1a2540] shrink-0">
            <select value={topicKey} onChange={e => changeTopic(e.target.value)}
              className="w-full border border-[#1a2540] text-[#e2e8f0] text-sm px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-[#2563eb] transition-colors" style={{ background: "#0c1a2e" }}>
              {TOPIC_KEYS.map(k => <option key={k} value={k}>{TOPICS[k].label}</option>)}
            </select>
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-[#2563eb] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h2 className="text-sm font-bold text-white">{topic.label}</h2>
            </div>

            <div className="text-[#c8d3e0] text-sm leading-relaxed whitespace-pre-line">
              {topic.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**"))
                  return <p key={i} className="font-bold text-white mt-4 mb-1 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
                if (line.startsWith("- "))
                  return <p key={i} className="pl-3 text-[#c8d3e0] mb-0.5">• {line.slice(2)}</p>;
                if (line.startsWith("✓") || line.startsWith("✗"))
                  return <p key={i} className={`pl-3 mb-0.5 ${line.startsWith("✓") ? "text-[#10b981]" : "text-[#ef4444]"}`}>{line}</p>;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="mb-1">{line}</p>;
              })}
            </div>
          </div>

          {/* bottom actions */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-[#1a2540] shrink-0">
            <button onClick={() => { setInput("Practice quiz on " + topic.label); textareaRef.current?.focus(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a54] text-xs text-[#8899b0] hover:text-white hover:border-[#2563eb]/40 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/><path d="M4 22h16"/></svg>
              Practice Quiz
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a54] text-xs text-[#8899b0] hover:text-white hover:border-[#2563eb]/40 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              Save Notes
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3a54] text-xs text-[#8899b0] hover:text-white hover:border-[#2563eb]/40 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
          </div>
        </div>

        {/* right: AI chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* chat header — gradient */}
          <div className="px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c0 0-4 4-4 7a4 4 0 0 0 8 0c0-3-4-7-4-7z" fill="white"/>
                  <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Aristotle</div>
                <div className="text-white/70 text-xs">
                  Your personal tutor · {difficulty} level
                </div>
              </div>
            </div>
          </div>

          {/* achievement toast */}
          {achievement && (
            <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/></svg>
              <span className="text-[#10b981] text-xs font-semibold">{achievement}</span>
            </div>
          )}

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 fade-in">
                <p className="text-white text-sm font-semibold">Ask about {topic.label.split(" - ").pop()}</p>
                <p className="text-[#8899b0] text-xs text-center max-w-xs">
                  I&apos;ll guide you with questions, not just answers.
                </p>
                <div className="flex flex-col gap-1.5 w-full max-w-xs">
                  {QUICK.map(q => (
                    <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                      className="text-xs text-[#8899b0] hover:text-white text-left px-3 py-2 rounded-lg hover:bg-[#0c1a2e] border border-transparent hover:border-[#1a2540] transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user" ? "bg-[#2563eb]" : "bg-gradient-to-br from-[#6d28d9] to-[#2563eb]"
                  } text-white`}>
                    {msg.role === "user" ? (user?.name || "U")[0].toUpperCase() : "A"}
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#2563eb]/15 border border-[#2563eb]/25 text-[#e2e8f0] rounded-tr-sm"
                      : "border border-[#1a2540] text-[#c8d3e0] rounded-tl-sm"
                  }`} style={msg.role === "assistant" ? { background: "#0c1a2e" } : {}}
                  dir={language === "urdu" && msg.role === "assistant" ? "rtl" : "ltr"}>
                    {msg.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-[#1a2540] text-[#7dd3fc] font-mono text-[10px]">{children}</code>,
                          pre: ({ children }) => <pre className="mt-2 mb-2 p-3 rounded-xl bg-[#091525] overflow-x-auto font-mono text-[10px] text-[#c8d3e0] leading-relaxed">{children}</pre>,
                          ul: ({ children }) => <ul className="pl-3 space-y-0.5 mb-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="pl-4 space-y-0.5 mb-1.5 list-decimal">{children}</ol>,
                          li: ({ children }) => <li className="text-[#c8d3e0]">• {children}</li>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-[#2563eb] pl-3 italic text-[#8899b0] my-1.5">{children}</blockquote>,
                        }}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="flex gap-1.5 items-center h-4">
                        {[0,1,2].map(d => <span key={d} className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8899b0] inline-block"/>)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-5 pb-4 pt-3 border-t border-[#1a2540] shrink-0">
            <div className="flex gap-2 items-end border border-[#1a2540] rounded-xl px-4 py-3 focus-within:border-[#2563eb] transition-colors" style={{ background: "#0c1a2e" }}>
              <textarea ref={textareaRef} rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                placeholder={language === "urdu" ? "یہاں سوال لکھیں…" : `Ask a question about this topic...`}
                dir={language === "urdu" ? "rtl" : "ltr"}
                className="flex-1 bg-transparent text-xs text-white placeholder-[#4a5568] outline-none resize-none max-h-24 leading-relaxed"
                style={{ fieldSizing: "content" } as React.CSSProperties} />
              <button onClick={send} disabled={streaming || !input.trim()}
                className="w-7 h-7 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-30 flex items-center justify-center transition-all shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
