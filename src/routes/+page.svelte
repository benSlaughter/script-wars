<section class="hero">
	<h1>⚔️ Script Wars</h1>
	<p class="tagline">Write a bot. Enter the arena. Watch it fight.</p>

	<div class="code-preview card">
		<pre><code><span class="comment">-- Your first warrior</span>
<span class="keyword">local</span> moves = &#123;"rock", "paper", "scissors"&#125;
<span class="keyword">return</span> moves[math.random(#moves)]</code></pre>
	</div>

	<div class="cta-row">
		<a href="/register" class="btn btn-primary">Create Account</a>
		<a href="/leaderboard" class="btn btn-ghost">View Leaderboard</a>
	</div>
</section>

<section class="how-it-works">
	<h2>How It Works</h2>
	<div class="steps">
		<div class="step card">
			<span class="step-icon">📝</span>
			<h3>Write a Script</h3>
			<p>Write a Lua script that returns a move — "rock", "paper", or "scissors".</p>
		</div>
		<div class="step card">
			<span class="step-icon">⚔️</span>
			<h3>Enter the Arena</h3>
			<p>Set your script as your active entry. It battles every other player's bot automatically.</p>
		</div>
		<div class="step card">
			<span class="step-icon">🏆</span>
			<h3>Climb the Ranks</h3>
			<p>Check the leaderboard. Tweak your strategy. Outsmart the competition.</p>
		</div>
	</div>
</section>

<style>
	.hero {
		text-align: center;
		padding: 3rem 0 2rem;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.tagline {
		font-size: 1.3rem;
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.code-preview {
		max-width: 420px;
		margin: 0 auto 2rem;
		text-align: left;
		font-family: var(--font-mono);
		font-size: 0.95rem;
		line-height: 1.7;
	}

	.code-preview .comment {
		color: var(--text-muted);
	}

	.code-preview .keyword {
		color: var(--accent);
	}

	.cta-row {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.how-it-works {
		padding: 3rem 0;
	}

	.how-it-works h2 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 1.8rem;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.step {
		text-align: center;
	}

	.step-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 0.75rem;
	}

	.step h3 {
		margin-bottom: 0.5rem;
	}

	.step p {
		color: var(--text-muted);
		font-size: 0.95rem;
	}
</style>
