---
title: "Get your code reviewed by Martin Fowler, kinda"
date: "2020-06-30"
category: programming
featured_index: 100
---

I picked up [Refactoring, by Martin Fowler](https://martinfowler.com/books/refactoring.html), and I am learning a lot. The book is written like a catalogue that you can refer back to later. And, for those who are seeking, **the book is an excellent chance to get your code reviewed by Martin Fowler!!** 😮

Martin starts the book with an example that he goes on to refactor in the first chapter. Sensing an insane opportunity, I stopped right away and copied this original code in Ruby. I then went ahead, wrote down my thoughts and refactored the code like I would if it was an actual thing I was working on. Once I was done, I went back to the book and compared Martin's notes against mine, and learnt from his thought process and code. I think this is the best way to read this chapter.

If you are someone who enjoys this, I highly recommend you give this a try too. And if not the book, use this blog to power your review.

# The Original Code, and provided Context

***(Psssst... You can find the full original code here: [Github](https://github.com/ketanbhatt/refactoring-rb/tree/master/chapter-1/a_first_example/original))***

We have a Theatre Company that perform plays in events. They charge customers based on the type of the play, and also provide a "Volume Credit" for future discounts. The Company stores data about their plays ([plays.json](https://github.com/ketanbhatt/refactoring-rb/blob/master/chapter-1/a_first_example/original/plays.json)) and bills ([invoices.json](https://github.com/ketanbhatt/refactoring-rb/blob/master/chapter-1/a_first_example/original/invoices.json)) in JSON files.

The simple code below is used to print a bill from an invoice. This is the code we will attempt to refactor. Assume that this code is part of a much larger system and we are refactoring while adding a feature to print bills in HTML. Moreover, the Company has plans to perform more types of plays in the future.

```ruby
# statement.rb

require 'json'

def statement(invoice, plays)
  total_amount = 0
  volume_credits = 0
  result = "Statement for #{invoice['customer']}\n"

  invoice['performances'].each do |perf|
    play = plays[perf['playID']]

    this_amount = 0

    case play['type']
    when 'tragedy'
      this_amount = 40000
      if perf['audience'] > 30
        this_amount += 1000 * (perf['audience'] - 30)
      end
    when 'comedy'
      this_amount = 30000
      if perf['audience'] > 20
        this_amount += 10000 + 500 * (perf['audience'] - 20)
      end
      this_amount += 300 * perf['audience']
    else
      raise Exception("Unknown type: #{play['type']}")
    end

    volume_credits += [perf['audience'] - 30, 0].max
    # Add extra credit for every 10 comedy attendees
    if 'comedy' == play['type']
      volume_credits += (perf['audience'] / 5).floor
    end

    result += "  #{play['name']}: $#{this_amount / 100} (#{perf['audience']} seats)\n"
    total_amount += this_amount
  end

  result += "Amount owed is $#{total_amount / 100}\n"
  result += "You earned #{volume_credits} credits\n"
end

plays_json = JSON.parse(File.read("./plays.json"))
invoices_json = JSON.parse(File.read("./invoices.json"))
result = statement(invoices_json.first, plays_json)
puts result
```

#### output

```text
Statement for
  Hamlet: $650 (55 seats)
  As You Like It: $580 (35 seats)
  Othello: $500 (40 seats)
Amount owed is $1730
You earned 47 credits
```

#### Note: If you are planning to do this yourself first, stop here. Come back once you have refactored the original code.

# My attempt at Refactoring

***(Psssst... You can find the refactored code here: [Github](https://github.com/ketanbhatt/refactoring-rb/tree/master/chapter-1/a_first_example/ketanbhatt))***

Reading through the code, this is what stood out for me:

1. The `statement` method returns a formatted text right now. I would like it to return a structured statement that I can format later as I wish, for example: for sending Slack notifications, emails. Additionally, it simplifies writing tests for this and the formatter methods.
2. The code that adds extra `volume_credits` for `comedy` plays, the comment states that we add extra credit for every "10" attendees, but the code adds a credit for every "5" attendees. Either this comment has gone stale, or there is a bug in the code. Either way, we can make the code more readable and remove the comment. (Aside: I like [antirez's blog about writing comments](http://antirez.com/news/124) a lot.)
3. Overall, it is difficult to understand what is going on in the code. I think we can make it more readable easily.
4. The method is doing too much, calculating `volume_credit` and `amount` for each type of play, and creating the text. It would be better if I can hand over this calculation to a different class that would do the needful, and my method just creates the text.
5. Because of this "doing too much", the code has become messy. It will become still messier if the calculation was different for each Play too (and not same for Plays of the same type).
6. Also, looks like that the calculation is in cents and is being converted to dollars in the text. The code should make this explicit. Maybe I could rename the variable to be `amount_in_cents`?
7. The code right now assumes `audience` to be present and to be a number. Maybe we should put in validations that `asserts` for this truth? Although it seems out of scope for our current exercise.

### Extract out the Calculation logic

I moved the code for calculating amount and volume credits to a different class and file. I also separated the calculation for the two types of plays.

In the future, adding new play types will just need a new class to be added.

```ruby
# statement_calculators.rb

class PlayTypeBaseStatementCalculator
  def initialize(play_id:, audience:)
    @play_id = play_id
    @audience = audience
  end

  def amount
    raise NotImplementedError
  end

  def volume_credits
    raise NotImplementedError
  end
end

class TragedyStatementCalculator < PlayTypeBaseStatementCalculator
  ...
end

class ComedyStatementCalculator < PlayTypeBaseStatementCalculator
  ...
end
```
<br>
I also implemented the calculation in a more verbose manner. I think this improves the readability of the code.

```ruby
# statement_calculators.rb

...

class TragedyStatementCalculator < PlayTypeBaseStatementCalculator
  def amount
    fixed_charge = 40_000
    total_additional_charge = 0

    included_attendee_count = 30
    charge_per_extra_person = 1000

    if @audience > included_attendee_count
      extra_attendee = @audience - included_attendee_count
      total_additional_charge += charge_per_extra_person * extra_attendee
    end

    fixed_charge + total_additional_charge
  end

  def volume_credits
    min_attendee_count = 30

    @audience > min_attendee_count ? @audience - 30 : 0
  end
end

class ComedyStatementCalculator < PlayTypeBaseStatementCalculator
  def amount
    fixed_charge = 30_000
    additional_charge_per_person = 300
    total_additional_charge = additional_charge_per_person * @audience

    included_attendee_count = 20
    charge_per_extra_person = 500
    additional_fixed_charge_if_extra_attendee = 10_000

    if @audience > included_attendee_count
      extra_attendee = @audience - included_attendee_count
      total_additional_charge += (charge_per_extra_person * extra_attendee) + additional_fixed_charge_if_extra_attendee
    end

    fixed_charge + total_additional_charge
  end

  def volume_credits
    min_attendee_count = 30
    extra_credit_for_every_n_attendee = 5

    credits = @audience > min_attendee_count ? @audience - 30 : 0
    credits += (@audience / extra_credit_for_every_n_attendee).floor

    credits
  end
end
```

### Return the right calculator for a Play

I wanted to separate out the logic behind fetching the right calculator for a play, so I created a getter for it.

```ruby
# statement_calculators.rb

...

def get_calculator(play, performance)
  audience = performance['audience']
  play_id = performance['play_id']

  case play['type']
  when 'tragedy'
    TragedyStatementCalculator.new(play_id: play_id, audience: audience)
  when 'comedy'
    ComedyStatementCalculator.new(play_id: play_id, audience: audience)
  else
    raise Exception
  end
end
```

### Calculate the Statement

Keeping calculation out of the formatting logic, I created a method that loops over the invoices, and generates a structure containing information about the bill.

This structured statement can now be used by any formatter.

```ruby
# statement_calculators.rb

...

def calculate_statement(invoice, plays)
  statement_hash = { performances: [] }

  invoice['performances'].each do |performance|
    play_id = performance['playID']
    play = plays[play_id]

    calculator = get_calculator(play, performance)

    statement_hash[:performances].push(
      {
        play_id: play_id,
        play_name: play['name'],
        audience: performance['audience'],
        amount: calculator.amount,
        volume_credits: calculator.volume_credits,
      }
    )
  end

  statement_hash[:customer] = invoice['customer']
  statement_hash[:total_amount] = statement_hash[:performances].reduce(0) { |sum, perf| sum + perf[:amount] }
  statement_hash[:total_volume_credits] = statement_hash[:performances].reduce(0) { |sum, perf| sum + perf[:volume_credits] }

  statement_hash
end
```

### Finally, generate the Bill

The original `statement` method is now `text_statement` and all it does is format the bill as needed. A new method, `html_statement` can now be defined similarly to format the bill in HTML.

```ruby
# statement.rb

require 'json'

require './statement_calculators'

def text_statement(invoice, plays)
  statement_data = calculate_statement(invoice, plays)

  lines = ["Statement for #{statement_data['customer']}"]

  statement_data[:performances].each do |perf|
    lines.push("  #{perf[:play_name]}: $#{perf[:amount] / 100} (#{perf[:audience]} seats)")
  end

  lines.push("Amount owed is $#{statement_data[:total_amount] / 100}")
  lines.push("You earned #{statement_data[:total_volume_credits]} credits")

  lines.join("\n")
end

def html_statement(invoice, plays)
  nil
end
```

<br>
I will call the refactoring done at this point.

Although, I can't seem to shake off this feeling that there is something more that can be done. I don't think I am completely happy with the changes 😕 Let's see what Sir Martin has to say.
<br><br>

<center>

![Excited Anticipation GIF](https://media.giphy.com/media/vA4EnqvJxDv2g/giphy.gif)

</center>


# Code Review, courtesy Martin Fowler

The process that Martin followed for refactoring the original code, in his words, was:
> 1. Decomposing the original function into a set of nested functions
> 2. Separate calculating and printing code, the two phases.
> 3. Introducing a polymorphic calculator for the calculation logic.

<br>

From what I have learnt in this chapter, in the **hypothetical scenario** in which Martin Fowler does a code review of my changes, this is what he would have to say:
1. _"I like that you are using an intermediate structure to pass the calculation from one 'phase' to another. I also like that both of us are calling the new class a `Calculator`"_ - Thank you Martin, thank you. I try.
2. _"Your methods might just be too verbose. Try implementing them without all that verbosity? Same with the class names."_ - 🗒
3. _"You could also maybe implement the `volume_credits` method in the base class as there seems to be some code that can be reused"_ - 🗒

# Code after addressing Martin's comments

***(Psssst... You can find the final refactored code here: [Github](https://github.com/ketanbhatt/refactoring-rb/tree/master/chapter-1/a_first_example/ketanbhatt_martin_reviewed))***


Based on Martin's comments and how he went about his refactoring, these are the changes I made to my code

### Rename the Calculator classes

I renamed the calculator classes. My names were too verbose and I didn't like them a lot. I liked the names Martin gave his classes better.

```ruby
# statement_calculators.rb

class StatementCalculator
  ...
end

class TragedyCalculator < StatementCalculator
  ...
end

class ComedyCalculator < StatementCalculator
  ...
end

...

```

### Pass complete objects to the Calculator class

I am now passing complete `performance` and `play` objects to the calculator class. This is easier for the callers now as they can simply pass what they have, and the calculation logic can make use of what it needs.
  1. I had previously opted to explicitly pass only those arguments that the `Calculator` class needed, and there is some benefit to it. For example: It becomes clearer what information `Calculator` needs. But then it can be argued that the caller doesn't need to know how the `Calculator` class works?
  2. If we are fearful of introducing breaking changes by omitting certain values from the passed object, values that the class might need, I don't think making the caller do extra work is the solution. Either the `Calculator` class should validate the input it is getting, or this validation should be done while creating these objects, or both.

```ruby
# statement_calculators.rb

class StatementCalculator
  def initialize(play, performance)
    @play_id = play['play_id']
    @audience = performance['audience']
  end
  ...
end

...

def get_calculator(play, performance)
  case play['type']
  when 'tragedy'
    TragedyCalculator.new(play, performance)
  when 'comedy'
    ComedyCalculator.new(play, performance)
  else
    raise Exception
  end
end
```

### Simplify `amount` and `volume_credits` implementations

I re-implemented `amount` and `volume_credits` methods in the `Calculator` classes. I think I went overboard with the verbosity earlier and didn't strike a good balance. I opted for longer names, that "felt" more readable/explanatory but, they had the opposite effect when I zoomed out.

The actual calculations were simple enough and just the expressions would do a good job explaining what is happening. I tried making it more readable by introducing variables to make the code self-documenting, but I now think that it was counterproductive.

I also realise that this is closer to the original definition of these methods, and I wasted my time for nothing. But hey, you wouldn't know until you tried.

```ruby
# statement_calculators.rb

...

class TragedyCalculator < StatementCalculator
  def amount
    result = 40_000
    result += 1000 * (@audience - 30) if @audience > 30

    result
  end

  def volume_credits
    [@audience - 30, 0].max
  end
end

class ComedyCalculator < StatementCalculator
  def amount
    result = 30_000
    result += 10_000 + 500 * (@audience - 20) if @audience > 20
    result += 300 * @audience

    result
  end

  def volume_credits
    base_credits = [@audience - 30, 0].max
    base_credits + (@audience / 5).floor
  end
end

...

```

### Implement `volume_credits` in the parent Calculator class

I changed the base `volume_credits` method to implement the part that is common to both types of play.
  1. I had previously opted to not do this because I thought it might be over-abstraction.
  2. But after seeing Martin's implementation, I find this current version to be much better. It makes the code easier to understand. The reader can just say, _"Okay, so we are doing what we do for all the types PLUS this extra thing."_


```ruby
# statement_calculators.rb

class StatementCalculator
  ...
  def volume_credits
    [@audience - 30, 0].max
  end
end

class TragedyCalculator < StatementCalculator
  ...
  # remove the definition of `volume_credits` here
end

class ComedyCalculator < StatementCalculator
  ...
  def volume_credits
    super + (@audience / 5).floor
  end
end

...

```

### Calculate totals within the loop in `calculate_statement`

While in flow of making these above mentioned changes, I also made some minor modifications to the `calculate_statement` method.
  1. Instead of looping over all the statements at the end to calculate the `total_sum` and `total_volume_credits`, I simply maintained a variable that I updated in each iteration of the loop and added that to my dictionary at the end.
  2. This I think makes the intention clearer, and the reader won't have to go through the `reduce` loop over again. `total_amount += perf_statement[:amount]` is beautifully simple.

Yes, I should have done this the first time itself 🤷‍♂️


```ruby
# statement_calculators.rb

...

def calculate_statement(invoice, plays)
  statement_hash = { customer: invoice['customer'], performances: [] }

  total_amount = 0
  total_volume_credits = 0

  invoice['performances'].each do |perf|
    play_id = perf['playID']
    play = plays[play_id]

    calculator = get_calculator(play, perf)
    perf_statement = {
      play_id: play_id,
      play_name: play['name'],
      audience: perf['audience'],
      amount: calculator.amount,
      volume_credits: calculator.volume_credits,
    }

    total_amount += perf_statement[:amount]
    total_volume_credits += perf_statement[:volume_credits]

    statement_hash[:performances].push(perf_statement)
  end

  statement_hash.merge(
    total_amount: total_amount, total_volume_credits: total_volume_credits
  )
end
```

<br>

😌 I can now shake off that bad feeling from earlier. I think we did good today 👍

# In Closing

Call me delusional, but it sure feels great to go through this process and learn from one of the foremost authority on the subject.

Another takeaway for me is around creating impact. Martin Fowler could teach people all that he has learnt one by one. It would be good for those few who were fortunate enough to be working with him directly and people like me would never get this chance. But he spent the time, wrote a book, and now his knowledge can educate thousands of people. That's the kind of impact I hope to make in my life someday.

I would love it if someone gets inspired by this and decides to go through this exercise. Reach out if you do!
