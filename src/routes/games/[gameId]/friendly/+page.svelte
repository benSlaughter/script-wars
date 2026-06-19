<script lang="ts">
	let { data } = $props();
	let playing = $state(false);
	let result: {
		myScript: string;
		opponentScript: string;
		opponentName: string;
		winsA: number;
		winsB: number;
		draws: number;
		winner: 'a' | 'b' | 'draw';
		rounds: { round: number; moveA: string | null; moveB: string | null; result: string }[];
	} | null = $state(null);
	let errorMsg = $state('');

	async function challenge(opponentScriptId: string) {
		playing = true;
		result = null;
		errorMsg = '';

		try {
			const res = await fetch(`/api/games/${data.gameId}/friendly-match`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ opponentScriptId })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Match failed' }));
				errorMsg = err.message || 'Match failed';
				return;
			}

			result = await res.json();
		} catch {
			errorMsg = 'Network error';
		} finally {
			playing = false;
		}
	}
</script>

<div class="friendly-page">
	<h1>⚔️ Friendly Match</h1>
	<p class="subtitle">Challenge another player — no effect on tournament rankings.</p>

	{#if errorMsg}
		<div class="card error-card">
			<p class="error">{errorMsg}</p>
		</div>
	{/if}

	{#if result}
		<div class="result-section">
			<h2>Match Result</h2>
			<div class="card result-card" class:win={result.winner === 'a'} class:loss={result.winner === 'b'} class:draw={result.winner === 'draw'}>
				<div class="result-banner">
					{#if result.winner === 'a'}
						<span class="result-icon">🏆</span>
						<span class="result-text">Victory!</span>
					{:else if result.winner === 'b'}
						<span class="result-icon">💀</span>
						<span class="result-text">Defeat</span>
					{:else}
						<span class="result-icon">🤝</span>
						<span class="result-text">Draw</span>
					{/if}
				</div>
				<div class="result-details">
					<div class="matchup">
						<span class="you">{result.myScript}</span>
						<span class="vs">vs</span>
						<span class="them">{result.opponentName}'s {result.opponentScript}</span>
					</div>
					<div class="score-line">
						<span class="win">{result.winsA}W</span>
						<span class="loss">{result.winsB}L</span>
						<span class="draw">{result.draws}D</span>
					</div>
				</div>
			</div>

			{#if result.rounds && result.rounds.length > 0}
				<details class="round-details">
					<summary>📋 Round-by-round breakdown ({result.rounds.length} rounds)</summary>
					<div class="card rounds-table">
						<table>
							<thead>
								<tr>
									<th>#</th>
									<th>Your Move</th>
									<th>Their Move</th>
									<th>Result</th>
								</tr>
							</thead>
							<tbody>
								{#each result.rounds as round}
									<tr>
										<td class="round-num">{round.round}</td>
										<td>{round.moveA ?? '❌ error'}</td>
										<td>{round.moveB ?? '❌ error'}</td>
										<td>
											{#if round.result === 'a_wins' || round.result === 'a_error'}
												<span class="win">✅</span>
											{:else if round.result === 'b_wins' || round.result === 'b_error'}
												<span class="loss">❌</span>
											{:else}
												<span class="draw">➖</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</details>
			{/if}
		</div>
	{/if}

	{#if !data.isLoggedIn}
		<div class="card empty">
			<p>Log in to play friendly matches.</p>
			<a href="/login" class="btn btn-primary">Log In</a>
		</div>
	{:else if !data.hasActiveScript}
		<div class="card empty">
			<p>You need an active script to play friendly matches.</p>
			<a href="/games/{data.gameId}/scripts" class="btn btn-primary">Go to Scripts</a>
		</div>
	{:else if data.opponents.length === 0}
		<div class="card empty">
			<p>No other players with active scripts yet. Invite someone!</p>
		</div>
	{:else}
		<div class="opponent-list">
			<h2>Choose an Opponent</h2>
			{#each data.opponents as opp}
				<div class="card opponent-card">
					<div class="opponent-info">
						<span class="opponent-name">
							<a href="/player/{opp.playerId}">{opp.playerName}</a>
						</span>
						<span class="opponent-script">{opp.scriptName}</span>
					</div>
					<button
						class="btn btn-primary"
						disabled={playing}
						onclick={() => challenge(opp.scriptId)}
					>
						{playing ? '⏳ Fighting...' : '⚔️ Challenge'}
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.friendly-page {
		max-width: 700px;
	}

	.subtitle {
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.opponent-list h2 {
		margin-bottom: 1rem;
	}

	.opponent-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.opponent-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.opponent-name {
		font-weight: 600;
		font-size: 1.1rem;
	}

	.opponent-script {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.error-card {
		border-color: var(--danger);
		margin-top: 1rem;
	}

	.error {
		color: var(--danger);
	}

	.result-section {
		margin-top: 2rem;
	}

	.result-section h2 {
		margin-bottom: 1rem;
	}

	.result-card {
		text-align: center;
	}

	.result-card.win {
		border-color: var(--success, #4caf50);
	}

	.result-card.loss {
		border-color: var(--danger, #f44336);
	}

	.result-card.draw {
		border-color: var(--warning, #ff9800);
	}

	.result-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.result-icon {
		font-size: 2.5rem;
	}

	.result-text {
		font-size: 1.8rem;
		font-weight: 700;
	}

	.matchup {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		font-size: 1rem;
	}

	.you {
		font-weight: 600;
		color: var(--accent);
	}

	.vs {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.them {
		font-weight: 600;
	}

	.score-line {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		font-size: 1.2rem;
		font-weight: 700;
	}

	.round-details {
		margin-top: 1rem;
	}

	.round-details summary {
		cursor: pointer;
		padding: 0.5rem;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.rounds-table {
		margin-top: 0.5rem;
		max-height: 400px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
	}

	td {
		padding: 0.4rem 0.5rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.85rem;
	}

	.round-num {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
	}
</style>
