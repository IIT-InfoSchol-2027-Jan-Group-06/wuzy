# Seed script for demo data - runs on container startup
# Tables are created by alembic migrations before this runs

import shutil
from datetime import UTC, datetime, timedelta
from pathlib import Path

import bcrypt
from sqlmodel import Session, delete, func, select

from app.db.session import engine
from app.models.conversation import Conversation, ConversationMember
from app.models.event import Event, EventEngagement
from app.models.follow import Follow
from app.models.group import Group, GroupMember
from app.models.post import Post
from app.models.quest import Quest, QuestSubtask, QuestSubtaskProgress
from app.models.ticket import Award, Ticket
from app.models.user import User

STORAGE_ROOT = Path("storage")
SEED_MEDIA = Path("seed_media")


def hash_password(password: str) -> str:
    # bcrypt directly (passlib 1.7.4 is deprecated and broken with bcrypt 5.x)
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed_media():
    """Copy committed seed images into the storage dir if it is empty."""
    if not SEED_MEDIA.exists():
        return
    for kind in ("post", "avatar"):
        src = SEED_MEDIA / kind
        dst = STORAGE_ROOT / kind
        if not src.is_dir():
            continue
        dst.mkdir(parents=True, exist_ok=True)
        for image in src.iterdir():
            if not image.is_file():
                continue
            target = dst / image.name
            if not target.exists():
                shutil.copy(image, target)


# Demo accounts: (email, password, username, display_name, bio, hobbies, avatar)
ACCOUNTS = [
    (
        "abhiruk@test.com",
        "password123",
        "abhiruk",
        "Abhiruk Prashan",
        "Full-stack dev by day, concert goer by night. I build things and break the dance floor.",
        ["Tech", "Music", "Gaming"],
        "avatar1.png",
    ),
    (
        "ravindu644@test.com",
        "password123",
        "ravindu644",
        "Ravindu Deshan",
        "Fitness nut and runner. Always up for a beach day.",
        ["Fitness", "Sports", "Travel"],
        "avatar2.png",
    ),
    (
        "sethuki@test.com",
        "password123",
        "sethuki",
        "Sethuki Karawita",
        "Designer who sketches between coffee breaks. Obsessed with typography and sunsets.",
        ["Art", "Design", "Reading"],
        "avatar3.png",
    ),
    (
        "azma@test.com",
        "password123",
        "azma",
        "Azma Ashraf",
        "Foodie and travel photographer. I collect stamps in my passport and recipes in my head.",
        ["Food", "Photography", "Travel"],
        "avatar4.png",
    ),
    (
        "charuki@test.com",
        "password123",
        "charuki",
        "Charuki Weheragoda",
        "Music lover, dancer, part-time DJ. Vibes over everything.",
        ["Music", "Dance", "Movies"],
        "avatar5.png",
    ),
]

# Connections: every pair is mutual (each person follows the other).
# Anything one partner posts shows up in the other's feed.
CONNECTIONS = [
    ("abhiruk", "sethuki"),
    ("abhiruk", "charuki"),
    ("abhiruk", "azma"),
    ("ravindu644", "sethuki"),
    ("sethuki", "charuki"),
    ("sethuki", "azma"),
    ("charuki", "ravindu644"),
]

# Posts per user: (media, caption, location, save_to_profile)
POSTS = {
    "abhiruk": [
        ("post1.png", "Golden hour doesn't get better than this", "new york", True),
        ("post3.png", "New setup, who dis", "colombo", True),
        ("event1.png", "Front row for the live set", "colombo", True),
        ("event5.png", "Going live in 10", "colombo", False),
    ],
    "ravindu644": [
        ("post2.png", "Morning run squad", "colombo", True),
        ("event2.png", "Beach clean-up morning", "galle", True),
        ("post4.png", "Post-gym refuel", "colombo", True),
    ],
    "sethuki": [
        ("post4.png", "Sketching the skyline", "kandy", True),
        ("event3.png", "Gallery opening night", "colombo", True),
        ("event7.png", "Print making workshop", "colombo", True),
    ],
    "azma": [
        ("post1,jpeg", "Market colours", "colombo", True),
        ("post1.png", "Market colours", "colombo", True),
        ("event4.png", "Sunrise at the coast", "mirissa", True),
    ],
    "charuki": [
        ("event3.png", "DJ set going off", "colombo", True),
        ("post3.png", "Studio session", "colombo", True),
        ("post2.png", "Grooving on the beach set", "mount lavinia", False),
    ],
}

# Connections: every pair is a DM thread. Messages themselves are ephemeral
# (WebSocket/Redis only), so threads carry membership but no stored content.

# Events on the Explore page. Each tuple is
# (title, description, host, category, tags, venue, location, price,
#  starts_in_days, starts_in_hours). Tags are the interest vocabulary the
# recommendation engine matches against a user's hobbies, so they mirror the
# demo accounts' hobbies (Tech, Music, Gaming, Fitness, Sports, Travel, Art,
# Design, Reading, Food, Photography, Dance, Movies).
EVENTS = [
    ("Lagos Afrobeat Night", "Afrobeats and highlife with a live band on the rooftop.", "The Velvet Room", "music", ["music", "dance"], "88 Plams", "Lekki, Lagos", "₦15,000", 0, 6),
    ("Indie Rock Night", "Three local indie bands, one sticky floor, hometown crowd.", "The Velvet Room", "music", ["music", "nightlife"], "Garden Bar", "Galle Face, Colombo", "₦8,000", 1, 20),
    ("DJ Sunset Set", "House set that rides the sun down over the water.", "Charuki C.", "music", ["music", "dance", "travel"], "Beach Deck", "Mount Lavinia", "₦5,000", 2, 17),
    ("Startup Pitch Night", "Founders get five minutes each; the room picks a winner.", "Innovation Hub", "tech", ["tech", "design"], "WTC Auditorium", "Bourbon Street, Lagos", "$20", 0, 9),
    ("Tech Conference", "Keynotes and workshops on the stack that pays the bills.", "DevFest Lagos", "tech", ["tech", "startups"], "Landmark Centre", "Victoria Island, Lagos", "$89", 5, 9),
    ("Hackathon Weekend", "48 hours, one theme, whatever you can build by Sunday.", "HackClub", "tech", ["tech", "gaming"], "Hub Space", "Colombo", "Free", 3, 9),
    ("Esports Arena Finals", "Grand finals night for the city's ranked teams.", "Arena 300", "sports", ["gaming", "sports"], "Arena 300", "Galle Road, Colombo", "₦7,000", 1, 18),
    ("Morning Beach Run", "Sunrise 5k along the shoreline, all paces welcome.", "Run Club", "sports", ["fitness", "sports", "travel"], "Beach Road", "Mount Lavinia", "Free", 0, 6),
    ("Sunrise Yoga", "Slow vinyasa on a terrace before the heat kicks in.", "Flow Studio", "sports", ["fitness", "wellness"], "Sky Lounge", "Colombo", "₦3,000", 2, 6),
    ("Gallery Opening Night", "New collection of painterly realism, wine and all.", "Sethuki K.", "art", ["art", "design", "photography"], "Lumen Gallery", "Kandy", "Free", 1, 19),
    ("Print Making Workshop", "Hand-carve a block and pull your own edition.", "Paper & Press", "art", ["art", "design"], "Old Town Studio", "Colombo", "₦4,500", 4, 10),
    ("Book Nook Meetup", "This month's read plus a round of barely book talk.", "The Reading Room", "art", ["reading", "art"], "Barefoot Cafe", "Colombo", "Free", 6, 17),
    ("Food & Wine Expo", "Tastings, pairings, and a whole row of street food.", "Gourmet Collective", "food", ["food", "wine"], "Convention Centre", "Victoria Island, Lagos", "₦10,000", 3, 12),
    ("Street Food Fest", "Two dozen stalls, chopsticks at the ready.", "City Eats", "food", ["food", "photography"], "Havelock Town", "Colombo", "₦2,000", 2, 19),
    ("Movie Night Premiere", "Opening night screening followed by a Q&A.", "CineClub", "movies", ["movies", "cinema"], "Regal Theatre", "Colombo", "₦5,000", 0, 21),
    ("Comedy Open Mic", "Local comedians testing their best material on you.", "Laugh Factory", "movies", ["movies", "comedy"], "The Comedy Cellar", "Lekki, Lagos", "₦6,000", 4, 20),
    ("Sunday Gospel Brunch", "Live gospel and soul over bottomless iced tea.", "The Velvet Room", "music", ["music", "food"], "Garden Bar", "Galle Face, Colombo", "₦7,000", 0, 10),
    ("Afro Pop Afterparty", "The DJ keeps the Afrobeat groove going past midnight.", "Charuki C.", "music", ["music", "dance"], "The Cellar", "Galle Face, Colombo", "₦4,000", 3, 22),
    ("Vinyl Listening Session", "Bring a record, spin a story, listen with strangers.", "Sound Archive", "music", ["music", "reading"], "Old Town Studio", "Colombo", "₦2,000", 7, 18),
    ("Backend Builds Cafe", "Brown-bag lunch, whiteboard talks, long-lived threads.", "Innovation Hub", "tech", ["tech", "design"], "Hub Space", "Colombo", "Free", 0, 12),
    ("Indie Game Jams", "Weekend sprint to ship one tiny playable game.", "Game Bloc", "tech", ["gaming", "tech"], "Arena 300", "Victoria Island, Lagos", "$15", 6, 9),
    ("AI Studio Hours", "Open lab: fine-tune, test, break, and retry models.", "DevFest Lagos", "tech", ["tech", "startups"], "Landmark Centre", "Victoria Island, Lagos", "$10", 9, 10),
    ("Night T20 Tournament", "Floodlit cricket, loud stands, local derby energy.", "City Strikers", "sports", ["sports", "gaming"], "Oval Grounds", "Colombo", "₦3,000", 2, 18),
    ("Trail Run Challenge", "Scrambles, river crossings, and a finisher medal.", "Run Club", "sports", ["fitness", "sports"], "Beach Road", "Mount Lavinia", "₦5,000", 8, 6),
    ("Iron Yoga & Brews", "Sunrise flexibility, then a cold-brew hang.", "Flow Studio", "sports", ["fitness", "wellness"], "Sky Lounge", "Colombo", "₦4,000", 11, 7),
    ("Clay & Coffee", "Wheel-throwing workshop with a stoneware gallery.", "Paper & Press", "art", ["art", "design"], "Old Town Studio", "Colombo", "₦6,500", 0, 14),
    ("Silk Screen Saturdays", "Pull limited-edition prints by hand.", "Print Social", "art", ["art", "reading"], "Hub Space", "Colombo", "₦5,000", 5, 11),
    ("Zine Fair", "Risky, radical, and self-published pages everywhere.", "The Reading Room", "art", ["reading", "art"], "Barefoot Cafe", "Colombo", "₦2,500", 10, 12),
    ("Chocolate & Wine Pairing", "Single-origin bars meeting a flight of reds.", "Gourmet Collective", "food", ["food", "wine"], "Convention Centre", "Victoria Island, Lagos", "₦8,000", 0, 17),
    ("Ramen Night Market", "Midnight bowls, charcoal grills, cash only.", "City Eats", "food", ["food", "photography"], "Havelock Town", "Colombo", "₦3,000", 4, 21),
    ("Sci-Fi Double Feature", "Two cult classics back to back on 35mm.", "CineClub", "movies", ["movies", "cinema"], "Regal Theatre", "Colombo", "₦6,000", 0, 20),
    ("Producers Circle Screening", "Early cut, live feedback, snacks at the back.", "CineClub", "movies", ["movies", "tech"], "The Comedy Cellar", "Lekki, Lagos", "$12", 12, 19),
]

# Demo engagement heat for the recommendation engine. Each entry is
# (event index into EVENTS, username, kind). These mimic what real users
# would log through POST /events/{id}/engage, so the collaborative "people
# like you are into this" signal is visible on the very first seed: music and
# movies light up via charuki for abhiruk, art via sethuki, food via azma,
# fitness and sports via ravindu644.
EVENT_ENGAGEMENTS = [
    (0, "charuki", "going"),
    (0, "azma", "view"),
    (1, "charuki", "view"),
    (2, "charuki", "going"),
    (2, "azma", "view"),
    (3, "sethuki", "view"),
    (4, "sethuki", "view"),
    (5, "sethuki", "view"),
    (6, "ravindu644", "view"),
    (6, "charuki", "view"),
    (7, "ravindu644", "going"),
    (7, "azma", "view"),
    (8, "ravindu644", "going"),
    (9, "sethuki", "going"),
    (9, "azma", "view"),
    (10, "sethuki", "going"),
    (11, "sethuki", "view"),
    (12, "azma", "going"),
    (12, "sethuki", "view"),
    (13, "azma", "going"),
    (13, "sethuki", "view"),
    (14, "charuki", "going"),
    (15, "charuki", "view"),
    (16, "charuki", "going"),
    (16, "azma", "view"),
    (17, "charuki", "going"),
    (17, "azma", "view"),
    (18, "sethuki", "view"),
    (18, "charuki", "view"),
    (19, "abhiruk", "going"),
    (19, "sethuki", "view"),
    (20, "abhiruk", "going"),
    (20, "ravindu644", "view"),
    (21, "abhiruk", "view"),
    (21, "sethuki", "view"),
    (22, "ravindu644", "going"),
    (22, "abhiruk", "view"),
    (23, "ravindu644", "going"),
    (23, "azma", "view"),
    (24, "ravindu644", "view"),
    (24, "sethuki", "view"),
    (25, "sethuki", "going"),
    (25, "abhiruk", "view"),
    (26, "sethuki", "going"),
    (26, "charuki", "view"),
    (27, "sethuki", "view"),
    (27, "azma", "view"),
    (28, "azma", "going"),
    (28, "sethuki", "view"),
    (29, "azma", "going"),
    (29, "ravindu644", "view"),
    (30, "charuki", "going"),
    (30, "abhiruk", "view"),
    (31, "charuki", "view"),
    (31, "abhiruk", "view"),
]


def seed_events(session: Session) -> None:
    """Seed events plus demo engagement heat if the catalog is empty.

    Skips when events already exist so a container restart never wipes the
    engagement history the recommendation engine learns from. "going" beats
    "view" for the same (user, event) pair in ranking weight, not in rows.
    """
    if session.exec(select(Event)).first():
        return

    usernames = {u.username: u.id for u in session.exec(select(User)).all()}
    event_ids = []
    base = datetime.now(UTC)
    for index in range(len(EVENTS)):
        title, description, host, category, tags, venue, location, price, days, hours = EVENTS[index]
        event = Event(
            title=title,
            description=description,
            image_url=f"https://picsum.photos/seed/event{index + 1}/400/600",
            host_name=host,
            host_avatar_url=f"https://picsum.photos/seed/host{index + 1}/50/50",
            category=category,
            tags=tags,
            venue=venue,
            location=location,
            price=price,
            start_time=base + timedelta(days=days, hours=hours),
        )
        session.add(event)
        session.flush()
        event_ids.append(event.id)

    for event_step, username, kind in EVENT_ENGAGEMENTS:
        user_id = usernames.get(username)
        if user_id is None:
            continue
        session.add(
            EventEngagement(
                user_id=user_id,
                event_id=event_ids[event_step],
                kind=kind,
            )
        )
    session.commit()
    print(f"Created events: {len(event_ids)}")

def seed():
    seed_media()
    with Session(engine) as session:
        if session.exec(select(User)).first():
            print("Database already seeded, skipping...")
            return

        users = {
            username: User(
                email=email,
                username=username,
                hashed_password=hash_password(password),
                display_name=display_name,
                bio=bio,
                hobbies=hobbies,
                avatar_url=f"/uploads/avatar/{avatar}",
                is_active=True,
            )
            for email, password, username, display_name, bio, hobbies, avatar in ACCOUNTS
        }
        for user in users.values():
            session.add(user)
        session.commit()
        for user in users.values():
            session.refresh(user)

        for first, second in CONNECTIONS:
            session.add(Follow(follower_id=users[first].id, followed_id=users[second].id))
            session.add(Follow(follower_id=users[second].id, followed_id=users[first].id))

        for author_name, posts in POSTS.items():
            for media, caption, location, save_to_profile in posts:
                session.add(
                    Post(
                        media_url=f"/uploads/post/{media}",
                        caption=caption,
                        location=location,
                        save_to_profile=save_to_profile,
                        user_id=users[author_name].id,
                    )
                )

        for first, second in CONNECTIONS:
            conversation = Conversation()
            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            session.add(
                ConversationMember(conversation_id=conversation.id, user_id=users[first].id)
            )
            session.add(
                ConversationMember(conversation_id=conversation.id, user_id=users[second].id)
            )

        # Demo group with several members, giving every account a group chat to test.
        group = Group(name="Weekend Squad", created_by=users["abhiruk"].id)
        session.add(group)
        session.commit()
        session.refresh(group)
        for member_name in ("abhiruk", "sethuki", "charuki", "azma"):
            session.add(
                GroupMember(group_id=group.id, user_id=users[member_name].id)
            )

        session.commit()

        seed_events(session)

        post_count = session.exec(select(Post)).all().__len__()
        conversation_count = session.exec(select(Conversation)).all().__len__()
        group_count = session.exec(select(Group)).all().__len__()
        print("Demo data seeded successfully!")
        print(f"Created users: {', '.join(users)}")
        print(f"Created posts: {post_count}, conversations: {conversation_count}, groups: {group_count}")
        print("Demo logins (password123): abhiruk, ravindu644, sethuki, azma, charuki @test.com")
        print("Backend URL base: http://localhost:8000")

# Tasks hold ordered subtasks. Each subtask has its own target, counter unit
# and reward; the user works through them one at a time, claiming each.
# Each entry: (task name, description, [(subtask name, target, unit, xp, sticker), ...])
QUESTS = [
    (
        "Attend Live Events",
        "Go to live events and climb the table.",
        [
            ("Attend 1 Event", 1, "completed", 20, False),
            ("Attend 3 Events", 3, "completed", 50, True),
            ("Attend 5 Events", 5, "completed", 100, True),
        ],
    ),
    (
        "Social Network",
        "Connect with people and grow your circle.",
        [
            ("Add 3 Friends", 3, "friends", 10, False),
            ("Add 5 Friends", 5, "friends", 25, False),
            ("Add 10 Friends", 10, "friends", 50, True),
        ],
    ),
    (
        "Ticket Sharing",
        "Share event tickets with your circle.",
        [
            ("Share 1 Ticket", 1, "tickets", 20, False),
            ("Share 3 Tickets", 3, "tickets", 40, False),
            ("Share 5 Tickets", 5, "tickets", 80, True),
        ],
    ),
    (
        "Daily Login",
        "Log in every day to earn awards.",
        [
            ("Day 1 Login", 1, "days", 10, False),
            ("3-Day Streak", 3, "days", 30, False),
            ("7-Day Streak", 7, "days", 50, True),
        ],
    ),
]

# Demo progress per task, applied on a fresh seed. Tuples name the subtask
# and its counter: one subtask complete-unclaimed (1/1) so the Claim button
# is immediately testable, the rest mid-way so the bars and counters show.
# Rows are unclaimed on purpose so the claim flow can be run end to end.
# Each entry: (task name, [(subtask name, current_progress), ...])
QUEST_START_PROGRESS = [
    ("Attend Live Events", [("Attend 1 Event", 1)]),
    ("Social Network", [("Add 3 Friends", 2)]),
    ("Ticket Sharing", [("Share 1 Ticket", 1)]),
    ("Daily Login", [("Day 1 Login", 1)]),
]


def seed_quests(session: Session) -> None:
    """Sync the task catalog: drop stale subtasks, add missing ones.

    Existing quests and subtasks keep their ids but their display, reward
    and target fields are refreshed from the catalog. Live user progress is
    preserved.
    """
    wanted_names = {quest[0] for quest in QUESTS}
    for stale in session.exec(select(Quest)).all():
        if stale.name not in wanted_names:
            session.delete(stale)
    session.commit()

    for index, (name, description, subtasks) in enumerate(QUESTS):
        quest = session.exec(select(Quest).where(Quest.name == name)).first()
        if quest is None:
            quest = Quest(name=name, description=description, sort_order=index)
            session.add(quest)
        else:
            quest.description = description
            quest.sort_order = index
            session.add(quest)
        session.commit()
        session.refresh(quest)

        wanted_subtasks = {subtask[0] for subtask in subtasks}
        for stale in session.exec(
            select(QuestSubtask).where(QuestSubtask.quest_id == quest.id)
        ).all():
            if stale.name not in wanted_subtasks:
                session.exec(
                    delete(QuestSubtaskProgress).where(QuestSubtaskProgress.subtask_id == stale.id)
                )
                session.delete(stale)
        session.commit()

        for sub_index, (sub_name, target, unit, xp, sticker) in enumerate(subtasks):
            subtask = session.exec(
                select(QuestSubtask).where(
                    QuestSubtask.quest_id == quest.id,
                    QuestSubtask.name == sub_name,
                )
            ).first()
            description = f"Complete {target} {unit} in {name}"
            if subtask is None:
                subtask = QuestSubtask(
                    quest_id=quest.id,
                    name=sub_name,
                    description=description,
                    target_count=target,
                    progress_unit=unit,
                    reward_xp=xp,
                    reward_sticker=sticker,
                    sort_order=sub_index,
                )
                session.add(subtask)
            else:
                subtask.description = description
                subtask.target_count = target
                subtask.progress_unit = unit
                subtask.reward_xp = xp
                subtask.reward_sticker = sticker
                subtask.sort_order = sub_index
                session.add(subtask)
    session.commit()


def seed_quest_progress(session: Session) -> None:
    """Add a demo progress row per subtask for every account, if missing.

    Existing rows keep their live counter and claim flag so a container
    restart never resets what a user already earned.
    """
    users = session.exec(select(User)).all()
    quests = {quest.name: quest for quest in session.exec(select(Quest)).all()}
    for user in users:
        for quest_name, subtask_progress in QUEST_START_PROGRESS:
            quest = quests.get(quest_name)
            if quest is None:
                continue
            for sub_name, current in subtask_progress:
                subtask = session.exec(
                    select(QuestSubtask).where(
                        QuestSubtask.quest_id == quest.id,
                        QuestSubtask.name == sub_name,
                    )
                ).first()
                if subtask is None:
                    continue
                exists = session.exec(
                    select(QuestSubtaskProgress).where(
                        QuestSubtaskProgress.subtask_id == subtask.id,
                        QuestSubtaskProgress.user_id == user.id,
                    )
                ).first()
                if exists is None:
                    session.add(
                        QuestSubtaskProgress(
                            user_id=user.id,
                            subtask_id=subtask.id,
                            current_progress=current,
                            claimed=False,
                        )
                    )
    session.commit()



def _run_ticket_award_seed() -> None:
    """Seed ticket and award demo data when users exist."""
    from sqlmodel import Session as _Session

    from app.db.session import engine as _engine

    with _Session(_engine) as _session:
        count = _session.exec(select(func.count(User.id))).one()
        if count > 0:
            seed_tickets(_session)
            seed_awards(_session)


def seed_tickets(session: Session) -> None:
    """Seed demo tickets for all users if they have none."""
    users = session.exec(select(User)).all()
    for user in users:
        exists = session.exec(
            select(Ticket).where(Ticket.user_id == user.id)
        ).first()
        if exists is None:
            session.add(Ticket(user_id=user.id, ticket_type="standard"))
    session.commit()


def seed_awards(session: Session) -> None:
    """Seed demo awards for users who have tickets."""
    users = session.exec(select(User)).all()
    for user in users:
        tickets = session.exec(
            select(Ticket).where(Ticket.user_id == user.id)
        ).all()
        for ticket in tickets:
            if not ticket.award_granted:
                award = Award(
                    user_id=user.id,
                    award_type="ticket_purchase",
                    reward_xp=50,
                )
                session.add(award)
                ticket.award_granted = True
                session.add(ticket)
        has_profile_award = session.exec(
            select(Award).where(
                Award.user_id == user.id,
                Award.award_type == "profile_complete",
            )
        ).first()
        if has_profile_award is None and user.bio and user.display_name:
            award = Award(
                user_id=user.id,
                award_type="profile_complete",
                reward_xp=100,
            )
            session.add(award)
    session.commit()


seed_tickets_if_present = _run_ticket_award_seed


def _run_quest_seed() -> None:
    """Seed the quest catalog + demo progress using main's idempotent style.

    Runs on every container start so a DB that rewinds (down -v) gets the
    award page's tasks + demo progress automatically.
    """
    from sqlmodel import Session as _Session

    from app.db.session import engine as _engine

    with _Session(_engine) as _session:
        count = _session.exec(select(func.count(User.id))).one()
        if count > 0:
            seed_quests(_session)
            seed_quest_progress(_session)


seed_quests_if_present = _run_quest_seed


def _run_events_seed() -> None:
    """Seed events + demo engagement heat on any start where users exist.

    Mirrors _run_quest_seed so already-seeded databases (whose main seed()
    short-circuits) still get the event catalog the first time they boot with
    this code.
    """
    from sqlmodel import Session as _Session

    from app.db.session import engine as _engine

    with _Session(_engine) as _session:
        count = _session.exec(select(func.count(User.id))).one()
        if count > 0:
            seed_events(_session)


seed_events_if_present = _run_events_seed

if __name__ == "__main__":
    seed()
    seed_quests_if_present()
    seed_events_if_present()
    seed_tickets_if_present()
