<script lang="ts">
</script>

<div class="docs">
	<h1>📖 Scripting Guide</h1>
	<p class="intro">
		Your bot is a Lua script that returns <code>"rock"</code>, <code>"paper"</code>, or <code>"scissors"</code>.
		Here's everything you need to write a winning strategy.
	</p>

	<section class="card">
		<h2>🎯 The Basics</h2>
		<p>Your script receives a <code>game</code> table and must return a valid move:</p>
		<pre><code>-- Simplest possible bot: always plays rock
return "rock"</code></pre>
		<p>That's it! But to win, you'll want to use the game context:</p>
		<pre><code>-- Use the round number to mix it up
if game.round % 3 == 1 then
  return "rock"
elseif game.round % 3 == 2 then
  return "paper"
else
  return "scissors"
end</code></pre>
	</section>

	<section class="card">
		<h2>🎮 The <code>game</code> Table</h2>
		<p>Your script has access to these variables:</p>
		<table class="api-table">
			<thead>
				<tr><th>Field</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>game.round</code></td><td>number</td><td>Current round (1–100)</td></tr>
				<tr><td><code>game.my_history</code></td><td>table</td><td>Your previous moves (strings)</td></tr>
				<tr><td><code>game.their_history</code></td><td>table</td><td>Opponent's previous moves (strings)</td></tr>
			</tbody>
		</table>
		<pre><code>-- Counter the opponent's last move
if game.round == 1 then
  return "rock"
end

local last = game.their_history[#game.their_history]
if last == "rock" then return "paper"
elseif last == "scissors" then return "rock"
else return "scissors"
end</code></pre>
	</section>

	<section class="card">
		<h2>🧰 Lua Cheatsheet</h2>

		<h3>Variables</h3>
		<pre><code>local x = 10          -- number
local name = "hello"  -- string
local flag = true     -- boolean
local list = &#123;1, 2, 3&#125;  -- table (array)</code></pre>

		<h3>Conditionals</h3>
		<pre><code>if x > 5 then
  -- do something
elseif x == 3 then
  -- another thing
else
  -- fallback
end</code></pre>

		<h3>Loops</h3>
		<pre><code>-- Count loop
for i = 1, 10 do
  print(i)
end

-- Loop over a table
for i, value in ipairs(list) do
  print(i, value)
end</code></pre>

		<h3>Tables (arrays & maps)</h3>
		<pre><code>local t = &#123;"rock", "paper", "scissors"&#125;
print(#t)       -- length: 3
print(t[1])     -- "rock" (1-indexed!)

-- Key-value map
local scores = &#123;rock = 0, paper = 0&#125;
scores.rock = scores.rock + 1</code></pre>

		<h3>Functions</h3>
		<pre><code>local function counter(move)
  if move == "rock" then return "paper"
  elseif move == "scissors" then return "rock"
  else return "scissors"
  end
end

return counter(game.their_history[#game.their_history] or "rock")</code></pre>

		<h3>Math & Random</h3>
		<pre><code>math.random()       -- float 0.0–1.0
math.random(3)      -- integer 1, 2, or 3
math.max(1, 5, 3)   -- 5
math.min(1, 5, 3)   -- 1
math.floor(3.7)     -- 3</code></pre>

		<h3>String Operations</h3>
		<pre><code>string.len("hello")         -- 5
string.sub("hello", 1, 3)   -- "hel"
"rock" == "rock"            -- true</code></pre>
	</section>

	<section class="card">
		<h2>💡 Strategy Ideas</h2>
		<ul>
			<li><strong>Random:</strong> Pick a random move each round — hard to predict!</li>
			<li><strong>Counter:</strong> Beat whatever they played last round</li>
			<li><strong>Pattern detection:</strong> Track their move frequencies and counter the most common</li>
			<li><strong>Mixed strategy:</strong> Play randomly but weight towards countering their favorite move</li>
			<li><strong>Markov chain:</strong> Predict their next move based on transitions between their moves</li>
		</ul>
		<pre><code>-- Frequency counter: play the counter to their most common move
local counts = &#123;rock = 0, paper = 0, scissors = 0&#125;
for _, move in ipairs(game.their_history) do
  counts[move] = counts[move] + 1
end

local most_common = "rock"
for move, count in pairs(counts) do
  if count > counts[most_common] then
    most_common = move
  end
end

-- Counter the most common
if most_common == "rock" then return "paper"
elseif most_common == "scissors" then return "rock"
else return "scissors"
end</code></pre>
	</section>

	<section class="card">
		<h2>⚠️ Rules & Limits</h2>
		<ul>
			<li>Scripts must return <code>"rock"</code>, <code>"paper"</code>, or <code>"scissors"</code></li>
			<li>Max 100,000 instructions per round (no infinite loops)</li>
			<li>Max 10KB script size</li>
			<li>No file/network/OS access — sandbox only</li>
			<li>Available globals: <code>math</code>, <code>string</code>, <code>table</code>, <code>pairs</code>, <code>ipairs</code>, <code>type</code>, <code>tostring</code>, <code>tonumber</code>, <code>select</code>, <code>unpack</code>, <code>pcall</code></li>
			<li>If your script errors or returns an invalid move, you forfeit that round</li>
		</ul>
	</section>

	<section class="card">
		<h2>🐛 Reading Error Messages</h2>
		<p>When your script has a bug, the test runner shows an error like:</p>
		<pre class="error-example"><code>💥 line 5: syntax error near 'if'</code></pre>

		<h3>What the parts mean</h3>
		<table class="api-table">
			<thead>
				<tr><th>Part</th><th>Meaning</th></tr>
			</thead>
			<tbody>
				<tr><td><code>line 5</code></td><td>The line number in <em>your</em> script where the error was found</td></tr>
				<tr><td><code>syntax error near 'if'</code></td><td>What went wrong — Lua found something unexpected near <code>if</code></td></tr>
			</tbody>
		</table>

		<h3>Common errors</h3>
		<table class="api-table">
			<thead>
				<tr><th>Error</th><th>Cause</th><th>Fix</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>syntax error near 'X'</code></td>
					<td>Unexpected token — usually a missing <code>then</code>, <code>end</code>, or typo</td>
					<td>Check the line above for missing keywords</td>
				</tr>
				<tr>
					<td><code>'end' expected</code></td>
					<td>An <code>if</code>, <code>for</code>, or <code>function</code> block wasn't closed</td>
					<td>Add the missing <code>end</code></td>
				</tr>
				<tr>
					<td><code>attempt to index a nil value</code></td>
					<td>Accessing a field on something that doesn't exist</td>
					<td>Check variable names and that tables are populated</td>
				</tr>
				<tr>
					<td><code>attempt to call a nil value</code></td>
					<td>Calling a function that doesn't exist</td>
					<td>Check spelling; some globals are removed in the sandbox</td>
				</tr>
				<tr>
					<td><code>Script timeout: exceeded maximum instructions</code></td>
					<td>Infinite loop or very long computation</td>
					<td>Add a loop exit condition or simplify logic</td>
				</tr>
			</tbody>
		</table>

		<h3>Tips</h3>
		<ul>
			<li>Errors often point to the line <em>after</em> the actual mistake — check the line above too</li>
			<li>Use the Test button frequently as you write — catch errors early</li>
			<li>If your script returns an invalid move (not rock/paper/scissors), you'll see a ⚠️ warning instead of an error</li>
		</ul>
	</section>

	<section class="card">
		<h2>🔗 Learn More</h2>
		<ul class="links-list">
			<li><a href="https://www.lua.org/manual/5.4/" target="_blank" rel="noopener">Lua 5.4 Reference Manual</a> — Official docs</li>
			<li><a href="https://www.lua.org/pil/" target="_blank" rel="noopener">Programming in Lua</a> — Free online book (1st edition)</li>
			<li><a href="https://learnxinyminutes.com/docs/lua/" target="_blank" rel="noopener">Learn Lua in Y Minutes</a> — Quick interactive overview</li>
			<li><a href="https://tylerneylon.com/a/learn-lua/" target="_blank" rel="noopener">Learn Lua in 15 Minutes</a> — Concise crash course</li>
			<li><a href="https://www.codecademy.com/resources/docs/lua" target="_blank" rel="noopener">Codecademy Lua Docs</a> — Beginner-friendly reference</li>
		</ul>
	</section>
</div>

<style>
	.docs {
		max-width: 800px;
		margin: 0 auto;
	}

	.intro {
		font-size: 1.1rem;
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 1.5rem;
	}

	h2 {
		margin-bottom: 0.75rem;
		font-size: 1.3rem;
	}

	h3 {
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--accent);
		font-size: 1rem;
	}

	pre {
		background: var(--bg);
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.85rem;
		margin: 0.75rem 0;
	}

	pre.error-example {
		border-left: 3px solid var(--red, #e74c3c);
		background: rgba(231, 76, 60, 0.05);
	}

	code {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}

	p code, li code, td code {
		background: var(--bg);
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
		font-size: 0.85em;
	}

	.api-table {
		width: 100%;
		border-collapse: collapse;
		margin: 0.75rem 0;
		font-size: 0.9rem;
	}

	.api-table th,
	.api-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.api-table th {
		color: var(--text-muted);
		font-weight: 600;
	}

	ul {
		padding-left: 1.5rem;
		line-height: 1.8;
	}

	.links-list li {
		margin-bottom: 0.5rem;
	}

	.links-list a {
		color: var(--accent);
		font-weight: 500;
	}
</style>
