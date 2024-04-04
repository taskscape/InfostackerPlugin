import http from './http';
import { TFile } from 'obsidian';

const baseUrl = 'https://share.taskscape.com';

interface CreateResponse {
	id: string;
	secret: string;
}

const obsiusWrapper = {
	async createPost(formData: FormData): Promise<CreateResponse> {
		return http('POST', `${baseUrl}/`, formData);
	},
	async updatePost(
		id: string,
		formData: FormData
	): Promise<void> {
		return http('PUT', `${baseUrl}/${id}`, formData);
	},
	async deletePost(id: string, secret: string): Promise<void> {
		return http('DELETE', `${baseUrl}/${id}`, {secret});
	},
};

export interface Post {
	id: string;
	secret: string;
}

export interface Data {
	posts: Record<string, Post>;
}

export interface ObsiusClient {
	data(): Data;

	publishPost(file: TFile): Promise<string | null>;

	createPost(id: string, view: FormData): Promise<string>;

	getUrl(view: TFile): string;

	updatePost(view: FormData): Promise<void>;

	deletePost(view: TFile): Promise<void>;
}

export async function createClient(
	loadData: () => Promise<Data>,
	saveData: (data: Data) => Promise<void>
): Promise<ObsiusClient> {
	const data = await loadData();

	return {
		data() {
			return data;
		},
		async publishPost(file: TFile) {
			if (data.posts[file.path]) {
				await this.updatePost(file);
				return null;
			} else {
				return await this.createPost(file);
			}
		},
		async createPost(file: TFile) {
			const title = file.basename;
			let content = await file.vault.read(file);

			// Example parsing logic to find attachment references in the content
			// This needs to be adjusted based on how attachments are referenced
			const attachmentPaths = this.extractAttachmentPaths(content);

			// Prepare formData for multipart/form-data submission
			const formData = new FormData();
			formData.append('title', title);
			formData.append('content', content);
			attachmentPaths.forEach((path) => {
				const attachmentFile = file.vault.getAbstractFileByPath(path);
				if (attachmentFile instanceof TFile) {
					formData.append('files[]', attachmentFile);
				}
			});

			try {
				const resp = await obsiusWrapper.createPost(formData); // Adjusted to pass formData directly
				data.posts[file.path] = {
					id: resp.id,
					secret: resp.secret,
				};
				await saveData(data);

				return `${baseUrl}/${resp.id}`;
			} catch (e) {
				console.error(e);
				throw new Error('Failed to create post');
			}
		},
		getUrl(file: TFile): string {
			const post = data.posts[file.path];
			if (!post) {
				return null;
			}

			return `${baseUrl}/${post.id}`;
		},
		async updatePost(file: TFile) {
			const post = data.posts[file.path];
			const title = file.basename;
			const content = await file.vault.read(file);

			const formData = new FormData();
			formData.append('secret', post.secret);
			formData.append('title', title);
			formData.append('content', content);

			// Example parsing logic to find attachment references in the content
			// This needs to be adjusted based on how attachments are referenced
			const attachmentPaths = this.extractAttachmentPaths(content);
			attachmentPaths.forEach((path) => {
				const attachmentFile = file.vault.getAbstractFileByPath(path);
				if (attachmentFile instanceof TFile) {
					formData.append('files[]', attachmentFile);
				}
			});

			try {
				await obsiusWrapper.updatePost(
					post.id,
					formData
				);
			} catch (e) {
				console.error(e);
				throw new Error('Failed to update post');
			}
		},
		async deletePost(file: TFile) {
			const post = data.posts[file.path];

			try {
				await obsiusWrapper.deletePost(post.id, post.secret);
				delete data.posts[file.path];
				await saveData(data);
			} catch (e) {
				console.error(e);
				throw new Error('Failed to delete post');
			}
		},
		// Example method to extract attachment paths from the content
		// Adjust the logic to match how attachments are referenced in your notes
		extractAttachmentPaths(content: string): string[] {
			const paths = [];
			const regex = /!\[.*?\]\((.*?)\)/g; // Example regex for markdown image links
			let match;
			while ((match = regex.exec(content)) !== null) {
				paths.push(match[1]);
			}
			return paths;
		},
	};
}
