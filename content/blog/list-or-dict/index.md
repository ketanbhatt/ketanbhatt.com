---
title: "How do I structure my data? Lists? Dictionaries? List of Dictionaries?"
date: "2020-01-25"
redirect_from:
  - /2020/01/26/structure-data-list-dictionary-hashmap-array/
---

You have some data in your database. How should you structure this data when you send it to the frontend, let's say, or want to work with it in your code? Should you convert the records to a list of dictionaries/hashmaps? Or should you just send them as a list of list? How do you know you have done the right thing?

![A confused looking Giraffe](./images/cover.jpg)
*Photo by [Melanie Dretvic](https://unsplash.com/@designwilde?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/confused?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)*

Most of us make these choices almost daily without even giving this a second thought, but this is the exact question someone asked me after they couldn't find a satisfying explanation for their dilemma. Turns out, this will be a genuine confusion for you if you are new to programming or have been in the industry for a very long time but you come from a different background.

I thought our discussion and ensuing explanation might be helpful to other people who are dealing with the same confusion.

## What is the right data structure?

**There is no wrong data structure. But there MIGHT be an option that is better than the rest for your current use case.** So don't worry, go on, and choose a structure that makes sense to you at that time.

The best way to represent your data will always depend on how you are going to access it. Do you just want to loop over all the data and display them? You probably need a list. Do you want to access specific data points by using their column name/keys? You probably need a dictionary. Do you have multiple records? You probably need a list of lists/dictionaries.

Don't panic, stay with me a little longer.

## Examples for developing intuition

Let's look at a few examples to develop intuition for making these choices. These examples are not rules, but guidelines to inform your decisions.

We will consider the following dataset for our examples and we will assume that we need to display this data on our website.

| id  | email  | date  | amount  | is_approved  |
|---|---|---|---|---|
| 1237907  | cplowman0@nps.gov  | 7/5/2019  | 240.5  | TRUE  |
| 1678984  | vizakson1@hexun.com  | 9/26/2019  | 414.03  | TRUE  |
| 2177890  | jgairdner2@intel.com  | 8/14/2019  | 938.55  | TRUE  |
| 1536823  | ebatchelor3@jalbum.net  | 5/8/2019  | 912.03  | FALSE  |
| 2074131  | edorset4@omniture.com  | 5/29/2019  | 178.92  | FALSE  |

Transactions (Mock data generated using [Mockaroo](https://mockaroo.com/))

### Display "email" for all the transactions

In this case, where you only need to display the emails one by one, just sending them as a list will do the job. Right?

```js
email_ids = [
    "cplowman0@nps.gov",
    "vizakson1@hexun.com",
    "jgairdner2@intel.com",
    "ebatchelor3@jalbum.net",
    "edorset4@omniture.com"
]
```

This is the simplest way to loop over the emails and display them on your website. Our frontend code could simply expect a list and loop over them.

I am writing the syntax for Jinja Templates, but that's because it is a light weight way of communicating what I want. The solution isn't Jinja specific and will hold true for any kind of backend or frontend templating engines.

```html
<body>
  Email IDs of people who transacted are:
  <ul>
    {% for email_id in email_ids %}
      <li>{{ email_id }}</li>
    {% endfor %}
  </ul>
</body>
```

But remember what I said about there being no incorrect way? So, just for fun, what are some other ways we could have done this? We could have passed this data to our frontend code as a list of list:

```js
email_ids = [
    ["cplowman0@nps.gov"],
    ["vizakson1@hexun.com"],
    ["jgairdner2@intel.com"],
    ["ebatchelor3@jalbum.net"],
    ["edorset4@omniture.com"]
]
```

Or a list of dictionaries:

```js
email_ids = [
    {"email": "cplowman0@nps.gov"},
    {"email": "vizakson1@hexun.com"},
    {"email": "jgairdner2@intel.com"},
    {"email": "ebatchelor3@jalbum.net"},
    {"email": "edorset4@omniture.com"}
]
```

You could also come up with more ways and none of them will be incorrect. As long as you can access the data you want, it isn't incorrect. But you start to see how sending just a list of emails was simpler, and the corresponding code that handles it on frontend was so much simpler.

### Display "email", "date" and "amount" for each transaction

Let's start from the frontend this time. Without thinking about how will we structure the data, what is the simplest way to display these specific columns? Maybe:

```html
<body>
  Some information about all the transactions
  {% for transaction in transactions %}
    <ul>
      <li>Email: {{ transaction.email_id }}</li>
      <li>Date: {{ transaction.date }}</li>
      <li>Amount: {{ transaction.amount }}</li>
    </ul>
  {% endfor %}
</body>
```

This looks like a readable piece of code, right? Looking at it, it kind of becomes clear how we want to send data to the frontend. We are going to send it as a list of dictionaries. Where each dictionary represents a transaction record:

```js
transactions = [
    {
        "id": 1237907,
        "email": "cplowman0@nps.gov",
        "date": "7/5/2019",
        "amount": 240.5
    },
    {
        "id": 1678984,
        "email": "vizakson1@hexun.com",
        "date": "9/26/2019",
        "amount": 414.03
    }
]
```

Again, we could very easily represent this data in multiple other ways and still be able to display the required information. For example, we could send this data as a list of list without column names:

```js
transactions = [
    [1237907, 'cplowman0@nps.gov', '7/5/2019', 240.5],
    [1678984, 'vizakson1@hexun.com', '9/26/2019', 414.03]
]
```

You might already be starting to realise (if not, don't worry, you will soon) how this could become unwieldy very quickly. You will have to access values of each transaction based on their index in the list which

1. starts to become less readable (`Amount: {{ transaction[3] }}`)
2. and makes it difficult to change things later, as you always have to count the index that you want (imagine you had 20 attributes, how difficult would it be to reliably count the index which you want to use?).

We could also add column names to the previous structure and make it a list of lists of lists (sounds complex!):

```js
transactions = [
    [
        ["id", 1237907],
        ["email", 'cplowman0@nps.gov'],
        ["date", '7/5/2019'],
        ["amount", 240.5],
    ],
    [
        ["id", 1678984],
        ["email", 'vizakson1@hexun.com'],
        ["date", '9/26/2019'],
        ["amount", 414.03]
    ]
]
```

This structure is easy to comprehend visually, but this still needs to be accessed the same way as before, by the index. Since we can not directly access the "keys" like with dictionaries, we still need to refer to them by index.

### Display all attributes for each transaction

This means we won't need to access columns directly by their column name, and that opens up the option for us to skip dictionaries this time. Why?
Because one unique characteristics of a dictionary is that we can access values directly by using the "key"/"hash" for them. But since we aren't going to be needing it here, we can choose not to use them.

Let's start again with the frontend this time. This is one way of writing the code for what we want:

```html
<body>
  All information about all the transactions
  {% for transaction in transactions %}
    <ul>
      {% for attribute in transaction %}
        <li>{{ attribute\[0\] }}: {{ attribute\[1\] }}</li>
      {% endfor %}
    </ul>
  {% endfor %}
</body>
```

From what it looks like, it might make sense to send data this time as a list of lists of lists:

```js
transactions = [
    [
        ["Id", 1237907],
        ["Email", 'cplowman0@nps.gov'],
        ["Date", '7/5/2019'],
        ["Amount", 240.5],
    ],
    [
        ["Id", 1678984],
        ["Email", 'vizakson1@hexun.com'],
        ["Date", '9/26/2019'],
        ["Amount", 414.03]
    ]
]
```

We could have structured this data as a list of dictionaries too, and that would be an equally good solution here, maybe even better. Why?
Because the frontend code will still remain equally readable, and it gives you the capability to access a particular key directly in the future (like, maybe the `id` for creating a detail link for each transaction etc.).

* * *

I hope the examples helped you create an intuitiveness around how to choose the right structure for your data and use case. If you still don't feel confident, do not worry, give yourself a few weeks of experience :)

> _There is no wrong data structure. But there MIGHT be an option that is better than the rest for your current usecase._
>
> Ketan Bhatt (never heard it anywhere else, so why not!)

Ciao!

* * *

### [Extra] [Python] What about Tuples?

When should I use Tuples instead of lists, you ask. As far as accessing data is concerned, tuples and lists behave in the same manner. Difference arises in how you can assign a new value or modify a value to an item in a tuple. You can't.

```py
my_list = [1, 2, 3]
my_list[1] = 42
print(my_list)  # Output: [1, 42, 3]

my_tuple = (1, 2, 3)
my_tuple[1] = 42  # TypeError: 'tuple' object does not support item assignment
```

Tuples are immutable, which means that you can not change the content of a tuple once it is created.

This has certain advantages on your backend side of code. You could use tuples for storing items which you want to protect from getting changed by the program (or a human) later by mistake.
I generally use tuples when I want to depict that this data shouldn't be changed: this collection of items isn't "appendable/extendable" or you can't modify the value of "amount" for a transaction simply by assigning it a new value.

```js
transactions = [
    (1237907, 'cplowman0@nps.gov', '7/5/2019', 240.5, True),
    (1678984, 'vizakson1@hexun.com', '9/26/2019', 414.03, True)
]
```

Fin.
