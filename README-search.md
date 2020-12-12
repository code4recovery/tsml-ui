@joshreisner @leggomyinfo Sorry for the delay, I've been dealing with some personal life things for the past month, and catching up with my full time job since.

> There is now a parameter Intergroups can change in their implementation to select the search logic they prefer.

This is correct.

> Under the default search logic, each search term will be joined with an AND statement: searching West Chester Brooklyn, for example, will yield results that contain West and Chester and Brooklyn. So the "West Brooklyn Group" will be excluded because it lacks "Chester", but the "From Brooklyn to West Chester Group" will be included within the results.

Under the default search logic, it treats the entire input as a single term. So "West Chester Brooklyn" would NOT include "From Brooklyn to West Chester Group", but WOULD include "**West Chester Brooklyn** Queens and Friends". The entire string has to be present, uninterrupted.

This is a fairly rudimentary search, not using a full-text search backend with scoring, such as you get with Google, ElasticSearch or SOLR. Implementing a full-text search opens fairly mammoth technical challenges.

> Assuming I've represented the default correctly above, can an individual user still use a pipe character to join two terms with OR logic instead? If so, what would "TermA | TermB Term C" translate to?

The function does a case insensitive search the following fields for the terms:

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

I hope this clarifies a few things. I'm going to go ahead and merge in this PR.
