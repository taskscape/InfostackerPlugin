import { Notice, Plugin, TFile } from 'obsidian';
import type { InfostackerClient } from './src/infostacker';
import { createClient } from './src/infostacker';
import { getText } from './src/text';
import { PublishedPostsModal } from './src/modals';

export default class InfostackerPlugin extends Plugin {
	InfostackerClient: InfostackerClient;

	async onload() {
		this.InfostackerClient = await createClient(
			async () => ({
				posts: {},
				...(await this.loadData()),
			}),
			async (data) => await this.saveData(data)
		);

		this.addInfostackerCommands()
		this.registerFileMenuEvent()
	}

	onunload() {
	}

	addInfostackerCommands(){
		this.addCommand({
			id: 'action.listPosts',
			name: getText('actions.listPosts.name'),
			callback: () => this.showPublishedPosts(),
		})
		this.addCommand({
			id: 'action.create',
			name: getText('actions.create.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !this.InfostackerClient.getUrl(view.file)
				}
				this.publishFile(view.file)
			}
		})
		this.addCommand({
			id: 'action.update',
			name: getText('actions.update.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !!this.InfostackerClient.getUrl(view.file)
				}
				this.updateFile(view.file)
			}
		})
		this.addCommand({
			id: 'action.copyUrl',
			name: getText('actions.copyUrl.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !!this.InfostackerClient.getUrl(view.file)
				}
				this.copyUrl(view.file)
			}
		})
		this.addCommand({
			id: 'action.remove',
			name: getText('actions.remove.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !!this.InfostackerClient.getUrl(view.file)
				}
				this.deleteFile(view.file)
			}
		})
	}

	registerFileMenuEvent(){
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile && file.extension === 'md') {
					menu.addSeparator();
					if (!this.InfostackerClient.getUrl(file)) {
						menu
							.addItem(item => item
								.setTitle(getText('actions.create.name'))
								.setIcon('up-chevron-glyph')
								.onClick(() => this.publishFile(file))
							);
					} else {
						menu
							.addItem(item => item
								.setTitle(getText('actions.update.name'))
								.setIcon('double-up-arrow-glyph')
								.onClick(() => this.updateFile(file))
							)
							.addItem(item => item
								.setTitle(getText('actions.copyUrl.name'))
								.setIcon('link')
								.onClick(() => this.copyUrl(file))
							)
							.addItem(item => item
								.setTitle(getText('actions.remove.name'))
								.setIcon('cross')
								.onClick(() => this.deleteFile(file))
							);
					}
					menu.addSeparator();
				}
			})
		);
	}

	showPublishedPosts(){
		new PublishedPostsModal(this.app, this.InfostackerClient).open();
	}

	async publishFile(file: TFile){
		try {
			const url = await this.InfostackerClient.createPost(file);
			await navigator.clipboard.writeText(url);
			new Notice(getText('actions.create.success'));
		} catch (e) {
			console.error(e);
			new Notice(getText('actions.create.failure'));
		}
	}

	async updateFile(file: TFile){
		try {
			await this.InfostackerClient.updatePost(file);
			new Notice(getText('actions.update.success'));
		} catch (e) {
			console.error(e);
			new Notice(getText('actions.update.failure'));
		}
	}

	async copyUrl(file: TFile){
		const url = this.InfostackerClient.getUrl(file);
		if (url) {
			await navigator.clipboard.writeText(url);
			new Notice(getText('actions.copyUrl.success'));
		} else {
			new Notice(getText('actions.copyUrl.failure'));
		}
	}

	async deleteFile(file: TFile){
		try {
			await this.InfostackerClient.deletePost(file);
			new Notice(getText('actions.remove.success'));
		} catch (e) {
			console.error(e);
			new Notice(getText('actions.remove.failure'));
		}
	}
}
