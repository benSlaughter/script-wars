<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { basicSetup } from 'codemirror';
	import { StreamLanguage } from '@codemirror/language';
	import { lua } from '@codemirror/legacy-modes/mode/lua';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { indentWithTab } from '@codemirror/commands';

	interface Props {
		value?: string;
		placeholder?: string;
		onchange?: (value: string) => void;
		readonly?: boolean;
	}

	let { value = '', placeholder = '', onchange, readonly = false }: Props = $props();

	let editorContainer: HTMLDivElement;
	let view: EditorView | undefined;

	const customTheme = EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '14px'
		},
		'.cm-scroller': {
			fontFamily: "'JetBrains Mono', monospace"
		},
		'.cm-gutters': {
			backgroundColor: '#1a1a2e',
			borderRight: '1px solid #2a2a3e'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#2a2a3e'
		}
	});

	onMount(() => {
		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged && onchange) {
				onchange(update.state.doc.toString());
			}
		});

		const extensions = [
			basicSetup,
			StreamLanguage.define(lua),
			oneDark,
			customTheme,
			keymap.of([indentWithTab]),
			updateListener
		];

		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}

		if (readonly) {
			extensions.push(EditorState.readOnly.of(true));
		}

		const state = EditorState.create({
			doc: value,
			extensions
		});

		view = new EditorView({
			state,
			parent: editorContainer
		});

		return () => {
			view?.destroy();
		};
	});

	export function getValue(): string {
		return view?.state.doc.toString() ?? value;
	}
</script>

<div class="editor-wrapper" bind:this={editorContainer}></div>

<style>
	.editor-wrapper {
		height: 100%;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.editor-wrapper :global(.cm-editor) {
		height: 100%;
	}

	.editor-wrapper :global(.cm-focused) {
		outline: none;
	}
</style>
