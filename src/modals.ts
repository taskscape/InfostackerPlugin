import { App, Modal, setIcon, TFile } from 'obsidian';
import { getText } from './text';
import { InfostackerClient } from './infostacker';

export class PublishedPostsModal extends Modal {
	constructor(app: App, private InfostackerClient: InfostackerClient) {
		super(app);
		this.app = app;
	}

	onOpen() {
		this.contentEl.createEl('h1', {text: getText('actions.listPosts.title')});

		for (const [path] of Object.entries(this.InfostackerClient.data().posts)) {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) {
				continue;
			}

			const container = this.contentEl.createEl('div', {
				cls: ['published-posts-modal', 'list-item-container'],
			});
			container.createEl('span', {text: path});

			const buttonContainer = container.createEl('div');

			const showFile = buttonContainer.createEl('button', {
				title: getText('actions.listPosts.showFile'),
			});
			showFile.addEventListener('click', () =>
				this.app.workspace.openLinkText(path, path)
					.then(() => this.close()));
			setIcon(showFile, 'file-text');

			const webLink = buttonContainer.createEl('a',{
				cls: 'hidden',
				href: this.InfostackerClient.getUrl(file),
			});

			const showPost = buttonContainer.createEl('button');
			showPost.addEventListener('click', () => {
				webLink.click();
				this.close();
			});
			setIcon(showPost, 'globe');
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
