import { TFile } from 'obsidian';

const baseUrl = 'https://share.infostacker.com';

interface CreateResponse {
	id: string;
	secret: string;
}

const infostackerWrapper = {
	async createPost(formData: FormData): Promise<CreateResponse> {
		
		var fetched = fetch(`${baseUrl}/Sharing/UploadMarkdownWithFiles`, {
			method: 'POST',
			body: formData
		}).then(async (resp) => {
			if (!resp.ok) {
				throw new Error(
					`Request failed: ${resp.status} - ${await resp.text()}`
				);
			}
	
			return await resp.json();
		});
		console.log("Fetch ",fetched);
		return fetched;
	},
	async updatePost(
		id: string,
		formData: FormData
	): Promise<void> {

		var fetched = fetch(`${baseUrl}/Sharing/${id}`, {
			method: 'PUT',
			body: formData
		}).then(async (resp) => {
			if (!resp.ok) {
				throw new Error(
					`Request failed: ${resp.status} - ${await resp.text()}`
				);
			}
	
			return await resp.json();
		});
		console.log("Fetch: ",fetched);
		return fetched;
	},
	async deletePost(id: string, formData: FormData): Promise<void> {
		var removed = fetch(`${baseUrl}/Sharing/${id}`, {
			method: 'DELETE',
			body: formData
		}).then(async (resp) => {
			if (!resp.ok) {
				throw new Error(
					`Request failed: ${resp.status} - ${await resp.text()}`
				);
			}
	
			return await resp.json();
		});
		console.log("Removed: ", removed);
		return removed;
	},
};

export interface Post {
	id: string;
	secret: string;
}

export interface Data {
	posts: Record<string, Post>;
}

export interface InfostackerClient {
	data(): Data;

	publishPost(file: TFile): Promise<string | null>;

	createPost(view: TFile): Promise<string>;

	getUrl(view: TFile): string;

	updatePost(view: TFile): Promise<void>;

	deletePost(view: TFile): Promise<void>;

	extractAttachmentPaths(content: string): string[];
}

export async function createClient(
	loadData: () => Promise<Data>,
	saveData: (data: Data) => Promise<void>
): Promise<InfostackerClient> {
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
			const content = await file.vault.read(file);
			const attachmentPaths = this.extractAttachmentPaths(content);
			const formData = new FormData();

			formData.append('markdown', content);

			for (const path of attachmentPaths) {
				const attachmentFile = file.vault.getAbstractFileByPath(path);
				if (attachmentFile instanceof TFile) {
					try {
						const attachmentContent = await attachmentFile.vault.readBinary(attachmentFile);
						const attachmentBlob = new Blob([attachmentContent]);
						formData.append('files', attachmentBlob, attachmentFile.name);
					} catch (e) {
						console.error(`Failed to read attachment: ${path}`, e);
						// Handle the error as per your application's requirements
					}
				}
			}
			
			try {
				const resp = await infostackerWrapper.createPost(formData);
				data.posts[file.path] = {
					id: resp.id,
					secret: resp.secret,
				};
				await saveData(data);
				console.log("Response: ",resp);

				return `${baseUrl}/Sharing/${resp.id}`;
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

			return `${baseUrl}/Sharing/${post.id}`;
		},

		async updatePost(file: TFile) {
			const post = data.posts[file.path];
    		const title = file.basename;
    		const content = await file.vault.read(file);
    		const attachmentPaths = this.extractAttachmentPaths(content);
    		const formData = new FormData();

			console.log ("Title: ",title)
			formData.append('title', title);
			formData.append('markdown', content);
			formData.append('secret',post.secret)

			for (const path of attachmentPaths) {
				const attachmentFile = file.vault.getAbstractFileByPath(path);
				if (attachmentFile instanceof TFile) {
					try {
						const attachmentContent = await attachmentFile.vault.readBinary(attachmentFile);
						const attachmentBlob = new Blob([attachmentContent]);
						formData.append('files', attachmentBlob, attachmentFile.name);
					} catch (e) {
						console.error(`Failed to read attachment: ${path}`, e);
						// Handle the error as per your application's requirements
					}
				}
			}

			try {
				await infostackerWrapper.updatePost(
					post.id,
					formData
				);
			} catch (e) {
				console.error(e);
				throw new Error('Failed to update post');
			}
		},

		async deletePost(file: TFile) {
			const formData = new FormData();
			const post = data.posts[file.path];

			formData.append('secret', post.secret);

			try {
				await infostackerWrapper.deletePost(post.id, formData);
				delete data.posts[file.path];
				await saveData(data);
			} catch (e) {
				console.error(e);
				throw new Error('Failed to delete post');
			}
		},

		extractAttachmentPaths(content: string): string[] {
			const paths = [];
			const regex = /!\[\[.*?\]\]/g;
			let match;
			while ((match = regex.exec(content)) !== null) {
				paths.push(match[0].substring(3, match[0].length - 2));
			}
			return paths;
		}
	};
}