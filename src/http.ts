export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export default async function (
	method: HTTPMethod,
	url: string,
	data: any = null
) {
	const headers = new Headers({
		Accept: "application/json",
	});
	if (data) {
		headers.set("Content-Type", "application/json");
	}

	const resp = await fetch(url, {
		method,
		headers,
		...(data ? { body: JSON.stringify(data) } : {}),
	});

	if (!resp.ok) {
		throw new Error(
			`Request failed: ${resp.status} - ${await resp.text()}`
		);
	}

	return parseInt(resp.headers.get("Content-Length") ?? "0") != 0
		? await resp.json()
		: null;
}
