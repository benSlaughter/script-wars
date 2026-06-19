<script lang="ts">
	let { data } = $props();
</script>

<section class="hero">
	<h1>⚔️ Script Wars</h1>
	<p class="tagline">Write code. Battle bots. Dominate.</p>
	<p class="subtitle">Write Lua scripts that fight in automated tournaments. Outsmart your opponents with strategy, not reflexes.</p>

	<div class="code-preview card">
		<pre><code><span class="comment">-- A cunning warrior</span>
<span class="keyword">if</span> round_number == <span class="number">1</span> <span class="keyword">then</span>
  <span class="keyword">return</span> <span class="string">"rock"</span>
<span class="keyword">end</span>

<span class="comment">-- Counter their last move</span>
<span class="keyword">local</span> c = &#123;rock=<span class="string">"paper"</span>, paper=<span class="string">"scissors"</span>,
  scissors=<span class="string">"rock"</span>&#125;
<span class="keyword">return</span> c[opponent_history[#opponent_history]]</code></pre>
	</div>

	<div class="cta-row">
		<a href="/register" class="btn btn-primary btn-lg">Join the Arena</a>
		<a href="/games" class="btn btn-ghost btn-lg">Browse Games</a>
	</div>
</section>

<section class="stats-section">
	<div class="stats-grid">
		<div class="stat-card card">
			<span class="stat-number">{data.stats.players}</span>
			<span class="stat-label">Players</span>
		</div>
		<div class="stat-card card">
			<span class="stat-number">{data.stats.scripts}</span>
			<span class="stat-label">Scripts</span>
		</div>
		<div class="stat-card card">
			<span class="stat-number">{data.stats.matches}</span>
			<span class="stat-label">Matches Played</span>
		</div>
		<div class="stat-card card">
			<span class="stat-number">{data.stats.tournaments}</span>
			<span class="stat-label">Tournaments</span>
		</div>
	</div>

	{#if data.minutesUntilNext > 0}
		<p class="next-tournament">⏱️ Next tournament in ~{data.minutesUntilNext} minutes</p>
	{/if}
</section>

{#if data.topPlayers.length > 0}
	<section class="highlights">
		<h2>🏆 Latest Tournament</h2>
		<div class="podium">
			{#each data.topPlayers as player, i}
				<div class="podium-card card" class:gold={i === 0} class:silver={i === 1} class:bronze={i === 2}>
					<span class="podium-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
					<span class="podium-name">{player.name}</span>
					<span class="podium-script">{player.scriptName}</span>
					<span class="podium-wins">{player.wins} wins</span>
				</div>
			{/each}
		</div>
	</section>
{/if}

<section class="how-it-works">
	<h2>How It Works</h2>
	<div class="steps">
		<div class="step card">
			<span class="step-icon">📝</span>
			<h3>1. Write a Script</h3>
			<p>Code a Lua bot using our in-browser editor. Access opponent history, round numbers, and more.</p>
		</div>
		<div class="step card">
			<span class="step-icon">⚔️</span>
			<h3>2. Enter Tournaments</h3>
			<p>Set your script as active. It fights every other bot in hourly round-robin tournaments.</p>
		</div>
		<div class="step card">
			<span class="step-icon">📈</span>
			<h3>3. Climb the Ranks</h3>
			<p>Analyse results, refine your strategy, and rise to the top of the leaderboard.</p>
		</div>
	</div>
</section>

{#if data.games.length > 0}
	<section class="games-section">
		<h2>Available Games</h2>
		<div class="games-grid">
			{#each data.games as game}
				<a href="/games/{game.id}/leaderboard" class="game-card card">
					<span class="game-icon">{game.icon}</span>
					<h3>{game.name}</h3>
					<p>{game.description}</p>
				</a>
			{/each}
		</div>
	</section>
{/if}

<section class="final-cta">
	<div class="card">
		<h2>Ready to battle?</h2>
		<p>It takes 30 seconds to write your first bot. No experience required.</p>
		<a href="/register" class="btn btn-primary btn-lg">Create Account</a>
	</div>
</section>

<style>
	.hero {
		text-align: center;
		padding: 4rem 0 3rem;
	}

	h1 {
		font-size: 3.5rem;
		margin-bottom: 0.5rem;
		letter-spacing: -0.02em;
	}

	.tagline {
		font-size: 1.5rem;
		color: var(--text);
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.1rem;
		color: var(--text-muted);
		margin-bottom: 2.5rem;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
	}

	.code-preview {
		max-width: 480px;
		margin: 0 auto 2.5rem;
		text-align: left;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.8;
	}

	.code-preview .comment { color: var(--text-muted); }
	.code-preview .keyword { color: var(--accent); }
	.code-preview .string { color: #a5d6a7; }
	.code-preview .number { color: #ffab91; }

	.cta-row {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-lg {
		padding: 0.85rem 2rem;
		font-size: 1.1rem;
	}

	/* Stats */
	.stats-section {
		padding: 2rem 0;
		text-align: center;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.stat-card {
		text-align: center;
		padding: 1.25rem 0.5rem;
	}

	.stat-number {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.next-tournament {
		margin-top: 1rem;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	/* Highlights */
	.highlights {
		padding: 2rem 0;
	}

	.highlights h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.podium {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.podium-card {
		text-align: center;
		padding: 1.5rem 1rem;
	}

	.podium-card.gold { border-color: #ffd700; }
	.podium-card.silver { border-color: #c0c0c0; }
	.podium-card.bronze { border-color: #cd7f32; }

	.podium-rank {
		font-size: 2rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.podium-name {
		display: block;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.podium-script {
		display: block;
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}

	.podium-wins {
		display: block;
		color: var(--accent);
		font-weight: 600;
		font-size: 0.9rem;
	}

	/* How it works */
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
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.step {
		text-align: center;
		padding: 2rem 1.5rem;
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

	/* Games */
	.games-section {
		padding: 2rem 0;
	}

	.games-section h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.game-card {
		text-align: center;
		padding: 2rem;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.2s, transform 0.2s;
	}

	.game-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.game-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 0.75rem;
	}

	.game-card h3 {
		margin-bottom: 0.5rem;
	}

	.game-card p {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	/* Final CTA */
	.final-cta {
		padding: 3rem 0;
		text-align: center;
	}

	.final-cta .card {
		padding: 3rem 2rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.final-cta h2 {
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
	}

	.final-cta p {
		color: var(--text-muted);
		margin-bottom: 1.5rem;
	}

	/* Mobile */
	@media (max-width: 600px) {
		h1 { font-size: 2.5rem; }
		.tagline { font-size: 1.2rem; }
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
		.cta-row { flex-direction: column; align-items: center; }
	}
</style>
