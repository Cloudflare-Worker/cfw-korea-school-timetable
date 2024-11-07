import { School, Weekday } from "comcigan.ts";

//@ts-ignore
function handleCors(request) {
	const headers = new Headers();
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type, X-Custom-Auth-Key");
	return headers;
}

export default {
	async fetch(request, env) {
	  switch (request.method) {
		case "OPTIONS":
			return new Response(null, {
				status: 204,
				headers: handleCors(request),
			});
		case "GET":
		const url = new URL(request.url);
		const schoolName = url.searchParams.get('schoolName');
		const grade = parseInt(url.searchParams.get('grade') || '0');
		const classNum = parseInt(url.searchParams.get('classNum') || '0');

		if (!grade || !classNum || !schoolName) {
			return new Response('Invalid grade or classNum, schoolName', {
				status: 400,
				headers: handleCors(request),
			});
		}

		try {
			const school = await School.fromName(schoolName);
			const weekdays = [Weekday.Monday, Weekday.Tuesday, Weekday.Wednesday, Weekday.Thursday, Weekday.Friday];
			const timetable: { [key: string]: any } = {};
	
			for (const day of weekdays) {
				timetable[Weekday[day]] = await school.getTimetable(grade, classNum, day);
			}
	
			return new Response(JSON.stringify(timetable), {
				headers: handleCors(request),
			});
		} catch (error) {
			return new Response('Error fetching timetable', {
				status: 500,
				headers: handleCors(request),
			});
		}

		default:
		  return new Response("Method Not Allowed", {
			status: 405,
			headers: {
			  ...handleCors(request),
			  Allow: "GET",
			},
		  });
	  }
	},
} satisfies ExportedHandler<Env>;
