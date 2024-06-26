function flatten(obj: Record<string, any>) {
	const result: { [key: string]: string } = {};

	for (const key of Object.keys(obj)) {
		const value = obj[key];

		if (typeof value === 'string') {
			result[key] = value;
		} else {
			const inner = flatten(value);
			for (const innerKey of Object.keys(inner)) {
				result[`${key}.${innerKey}`] = inner[innerKey];
			}
		}
	}

	return result;
};

const strings = flatten({
	serviceName: 'Infostacker note manager',
	actions: {
		create: {
			name: 'Publish to Infostacker',
			success: 'Note published to Infostacker. URL copied to clipboard.',
			failure: 'Failed to publish note to Infostacker',
			failureFileSizeLimit: 'Failed to publish note to Infostacker: File size exceeds the 25MB limit.'
		},
		update: {
			name: 'Update in Infostacker',
			success: 'Updated note in Infostacker. It may take a little while before update becomes visible.',
			failure: 'Failed to update note in Infostacker',
			failureFileSizeLimit: 'Failed to publish note to Infostacker: File size exceeds the 25MB limit.'
		},
		copyUrl: {
			name: 'Copy Infostacker\'s note URL',
			success: 'Infostacker\'s note URL copied to clipboard',
			failure: 'Note not yet published'
		},
		remove: {
			name: 'Remove from Infostacker',
			success: 'Note removed from Infostacker',
			failure: 'Failed to remove note from Infostacker'
		},
		listPosts: {
			name: 'View published posts',
			title: 'Published posts',
			showFile: 'View file',
			showPost: 'View post',
		}
	},
	modals: {
		showUrl: {
			title: 'Note published at:',
			copy: 'Copy URL',
		}
	}
});

export function getText(path: string, ...args: string[]) {
	const value = strings[path];
	if (value !== undefined) {
		if (args.length) {
			return `${value}: ${args.join(', ')}`;
		}

		return value;
	}

	return path;
}
