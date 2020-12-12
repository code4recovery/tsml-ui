# Search: How It Works

Web servants can configure the search to work in one of three ways. Each of these allows terms to be search with **OR** logic. This is a fairly basic search using case insentitive string matching, not using a full-text search backend with scoring, such as you get with Google, ElasticSearch or SOLR.

The search function does a case insensitive search the following fields for the terms:

- meeting.formatted_address
- meeting.group
- meeting.group_notes
- meeting.location
- meeting.location_notes
- meeting.name
- meeting.notes

Here are a few examples of the three different search options, and the results they will return.

1. These will all return meetings that have the term "west chester" in any of the above fields:

    * `default`: west chester
    * `or`: west chester
    * `quoted`: "west chester"

1. These will all return meetings that have the term "west chester" or "brooklyn" or "queens" in any of the above fields:

    * `default`: west chester|brooklyn|queens
    * `or`: west chester OR brooklyn OR queens
    * `quoted`: "west chester" brooklyn queens

1. These will all return meetings that have the term "west" or "chester" in any of the above fields, including "west side highway" meetings and "north chester" meetings:

    * `default`: west|chester
    * `or`: west OR chester
    * `quoted`: west chester
