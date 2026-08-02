import "dotenv/config";

export async function getPosts(username) {
    const posts = [];

    let json = await getFirstPage(username);

    parsePosts(json, posts);
    let end_cursor =
        json.data.xdt_api__v1__feed__user_timeline_graphql_connection.page_info
            .end_cursor;
    let has_next_page =
        json.data.xdt_api__v1__feed__user_timeline_graphql_connection.page_info
            .has_next_page;

    while (has_next_page) {
        json = await getNextPage(username, end_cursor);
        parsePosts(json, posts);
        end_cursor =
            json.data.xdt_api__v1__feed__user_timeline_graphql_connection
                .page_info.end_cursor;
        has_next_page =
            json.data.xdt_api__v1__feed__user_timeline_graphql_connection
                .page_info.has_next_page;
    }

    return posts;
}

async function getFirstPage(username) {
    const response = await fetch("https://www.instagram.com/graphql/query", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-ig-app-id": process.env.IG_APP_ID,
            "x-csrftoken": process.env.IG_CSRFTOKEN,
            cookie: process.env.IG_COOKIE,
            "user-agent": process.env.IG_USER_AGENT,
        },
        body: JSON.stringify({
            doc_id: "27049966264681466",
            variables: {
                data: {
                    count: 12,
                    include_reel_media_seen_timestamp: true,
                    include_relationship_info: true,
                    latest_besties_reel_media: true,
                    latest_reel_media: true,
                },
                username: username,
                __relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider: false,
                __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
                __relay_internal__pv__PolarisAIGMAccountLabelEnabledrelayprovider: false,
                __relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider: false,
            },
        }),
    });
    return response.json();
}

async function getNextPage(username, end_cursor) {
    const response = await fetch("https://www.instagram.com/graphql/query", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-ig-app-id": process.env.IG_APP_ID,
            "x-csrftoken": process.env.IG_CSRFTOKEN,
            cookie: process.env.IG_COOKIE,
            "user-agent": process.env.IG_USER_AGENT,
        },
        body: JSON.stringify({
            doc_id: "27414153238279961",
            variables: {
                after: end_cursor,
                before: null,
                data: {
                    count: 12,
                    include_reel_media_seen_timestamp: true,
                    include_relationship_info: true,
                    latest_besties_reel_media: true,
                    latest_reel_media: true,
                },
                first: 12,
                include_multi_captions: false,
                last: null,
                username: username,
                __relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider: false,
                __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
                __relay_internal__pv__PolarisAIGMAccountLabelEnabledrelayprovider: false,
                __relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider: false,
            },
        }),
    });
    return response.json();
}

function parsePosts(json, posts) {
    const edges =
        json.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges;
    edges.forEach((edge) => {
        const node = edge.node;
        const pk = node.pk;
        const id = node.id;
        const taken_at = node.taken_at;
        const text = node.caption?.text ?? "";

        const post = {
            pk: pk,
            id: id,
            taken_at: taken_at,
            text: text,
            media: [],
        };

        const carousel_media = node.carousel_media;
        const video_versions = node.video_versions;
        const image_versions2 = node.image_versions2;

        if (carousel_media) {
            carousel_media.forEach((media) => {
                const url = media.image_versions2.candidates[0].url;
                post.media.push(url);
            });
            posts.push(post);
            return;
        }

        if (video_versions) {
            const url = video_versions[0].url;
            post.media.push(url);
            posts.push(post);
            return;
        }

        if (image_versions2) {
            const url = image_versions2.candidates[0].url;
            post.media.push(url);
            posts.push(post);
            return;
        }
    });
}
