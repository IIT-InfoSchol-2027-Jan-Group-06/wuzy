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
from app.models.ticket import Ticket
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
    for kind in ("post", "avatar", "event"):
        src = SEED_MEDIA / kind
        dst = STORAGE_ROOT / kind
        if not src.is_dir():
            continue
        dst.mkdir(parents=True, exist_ok=True)
        for image in src.iterdir():
            if not image.is_file():
                continue
            shutil.copy(image, dst / image.name)
    # Profile grid pictures live per user in grid_pricture/<username>/. The
    # numbered files are the curated set; copy them into the post dir under a
    # per-user name so nothing collides and no file is moved out of its folder.
    grid = SEED_MEDIA / "grid_pricture"
    if grid.is_dir():
        post_dir = STORAGE_ROOT / "post"
        post_dir.mkdir(parents=True, exist_ok=True)
        for user_dir in sorted(grid.iterdir()):
            if not user_dir.is_dir():
                continue
            for image in sorted(user_dir.iterdir()):
                if not image.is_file() or not image.stem.isdigit():
                    continue
                target = post_dir / f"grid_{user_dir.name}_{image.name}"
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
        "avatar1.webp",
    ),
    (
        "ravindu644@test.com",
        "password123",
        "ravindu644",
        "Ravindu Deshan",
        "Fitness nut and runner. Always up for a beach day.",
        ["Fitness", "Sports", "Travel"],
        "avatar2.webp",
    ),
    (
        "sethuki@test.com",
        "password123",
        "sethuki",
        "Sethuki Karawita",
        "Designer who sketches between coffee breaks. Obsessed with typography and sunsets.",
        ["Art", "Design", "Reading"],
        "avatar3.webp",
    ),
    (
        "azma@test.com",
        "password123",
        "azma",
        "Azma Ashraf",
        "Foodie and travel photographer. I collect stamps in my passport and recipes in my head.",
        ["Food", "Photography", "Travel"],
        "avatar4.webp",
    ),
    (
        "charuki@test.com",
        "password123",
        "charuki",
        "Charuki Weheragoda",
        "Music lover, dancer, part-time DJ. Vibes over everything.",
        ["Music", "Dance", "Movies"],
        "avatar5.webp",
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
# Grid pictures come from seed_media/grid_pricture/<username>/ and are seeded
# as permanent profile posts.
POSTS = {
    "abhiruk": [
        ("grid_abhiruk_1.webp", "Golden hour doesn't get better than this", "colombo", True),
        ("grid_abhiruk_2.webp", "Day on the go", "colombo", True),
        ("grid_abhiruk_3.webp", "Made with care", "colombo", True),
        ("grid_abhiruk_4.webp", "Worth the wait", "colombo", True),
    ],
    "ravindu644": [
        ("post2.webp", "Morning run squad", "colombo", True),
        ("event2.webp", "Beach clean-up morning", "galle", True),
        ("post4.webp", "Post-gym refuel", "colombo", True),
    ],
    "sethuki": [
        ("grid_sethuki_1.webp", "Sketching the skyline", "kandy", True),
        ("grid_sethuki_2.webp", "Lines and light", "kandy", True),
        ("grid_sethuki_3.webp", "Everyday details", "kandy", True),
        ("grid_sethuki_4.webp", "Still learning", "kandy", True),
    ],
    "azma": [
        ("grid_azma_1.webp", "Market colours", "colombo", True),
        ("grid_azma_2.webp", "Salt in the air", "mirissa", True),
        ("grid_azma_3.webp", "New plate, old favourites", "colombo", True),
        ("grid_azma_4.webp", "Golden frame", "galle", True),
    ],
    "charuki": [
        ("grid_charuki_1.webp", "Setting up the set", "colombo", True),
        ("grid_charuki_2.webp", "Studio session", "colombo", True),
        ("grid_charuki_3.webp", "Grooving all day", "mount lavinia", True),
    ],
}

# Connections: every pair is a DM thread. Messages themselves are ephemeral
# (WebSocket/Redis only), so threads carry membership but no stored content.

# Events on the Explore page. Each tuple is
# (title, description, host, category, tags, venue, location, price,
#  starts_in_days, starts_in_hours, image). image is a file in
# seed_media/event/ served from /uploads/event/. Tags are the interest
# vocabulary the recommendation engine matches against a user's hobbies, so
# they mirror the demo accounts' hobbies (Tech, Music, Gaming, Fitness,
# Sports, Travel, Art, Design, Reading, Food, Photography, Dance, Movies).
EVENTS = [
    (
        "Afrobeat Rooftop Night",
        "Afrobeats and highlife with a live band on the rooftop.",
        "The Velvet Room",
        "music",
        ["music", "dance"],
        "The Rooftop",
        "Colombo 03",
        "Rs 5,000",
        0,
        6,
        "event1.webp",
    ),
    (
        "Indie Rock Night",
        "Three local indie bands, one sticky floor, hometown crowd.",
        "The Velvet Room",
        "music",
        ["music", "nightlife"],
        "Garden Bar",
        "Galle Face, Colombo",
        "Rs 2,500",
        1,
        20,
        "event2.webp",
    ),
    (
        "DJ Sunset Set",
        "House set that rides the sun down over the water.",
        "Charuki C.",
        "music",
        ["music", "dance", "travel"],
        "Beach Deck",
        "Mount Lavinia",
        "Rs 2,000",
        2,
        17,
        "event3.webp",
    ),
    (
        "Startup Pitch Night",
        "Founders get five minutes each; the room picks a winner.",
        "Innovation Hub",
        "tech",
        ["tech", "design"],
        "WTC Auditorium",
        "WTC, Colombo 03",
        "Rs 6,000",
        0,
        9,
        "event4.webp",
    ),
    (
        "Tech Conference",
        "Keynotes and workshops on the stack that pays the bills.",
        "DevFest Lanka",
        "tech",
        ["tech", "startups"],
        "BMICH",
        "Colombo 07",
        "Rs 15,000",
        5,
        9,
        "event5.webp",
    ),
    (
        "Hackathon Weekend",
        "48 hours, one theme, whatever you can build by Sunday.",
        "HackClub",
        "tech",
        ["tech", "gaming"],
        "Hub Space",
        "Colombo 03",
        "Free",
        3,
        9,
        "event6.webp",
    ),
    (
        "Esports Arena Finals",
        "Grand finals night for the city's ranked teams.",
        "Echelon Arena",
        "sports",
        ["gaming", "sports"],
        "Echelon Arena",
        "Galle Road, Colombo",
        "Rs 2,500",
        1,
        18,
        "event7.webp",
    ),
    (
        "Morning Beach Run",
        "Sunrise 5k along the shoreline, all paces welcome.",
        "Run Club",
        "sports",
        ["fitness", "sports", "travel"],
        "Beach Road",
        "Mount Lavinia",
        "Free",
        0,
        6,
        "event8.webp",
    ),
    (
        "Sunrise Yoga",
        "Slow vinyasa on a terrace before the heat kicks in.",
        "Flow Studio",
        "sports",
        ["fitness", "wellness"],
        "Sky Lounge",
        "Colombo",
        "Rs 1,200",
        2,
        6,
        "event9.webp",
    ),
    (
        "Gallery Opening Night",
        "New collection of painterly realism, wine and all.",
        "Sethuki K.",
        "art",
        ["art", "design", "photography"],
        "Lumen Gallery",
        "Kandy",
        "Free",
        1,
        19,
        "event10.webp",
    ),
    (
        "Print Making Workshop",
        "Hand-carve a block and pull your own edition.",
        "Paper & Press",
        "art",
        ["art", "design"],
        "Old Town Studio",
        "Colombo",
        "Rs 1,500",
        4,
        10,
        "event11.webp",
    ),
    (
        "Book Nook Meetup",
        "This month's read plus a round of barely book talk.",
        "The Reading Room",
        "art",
        ["reading", "art"],
        "Barefoot Cafe",
        "Colombo",
        "Free",
        6,
        17,
        "event12.webp",
    ),
    (
        "Food & Wine Expo",
        "Tastings, pairings, and a whole row of street food.",
        "Gourmet Collective",
        "food",
        ["food", "wine"],
        "BMICH",
        "Colombo 07",
        "Rs 3,500",
        3,
        12,
        "event13.webp",
    ),
    (
        "Street Food Fest",
        "Two dozen stalls, chopsticks at the ready.",
        "City Eats",
        "food",
        ["food", "photography"],
        "Havelock Town",
        "Colombo",
        "Rs 800",
        2,
        19,
        "event14.webp",
    ),
    (
        "Movie Night Premiere",
        "Opening night screening followed by a Q&A.",
        "CineClub",
        "movies",
        ["movies", "cinema"],
        "Regal Theatre",
        "Colombo",
        "Rs 1,500",
        0,
        21,
        "event15.webp",
    ),
    (
        "Comedy Open Mic",
        "Local comedians testing their best material on you.",
        "Laugh Factory",
        "movies",
        ["movies", "comedy"],
        "The Comedy Club",
        "Bambalapitiya, Colombo 04",
        "Rs 2,000",
        4,
        20,
        "event16.webp",
    ),
    (
        "Sunday Gospel Brunch",
        "Live gospel and soul over bottomless iced tea.",
        "The Velvet Room",
        "music",
        ["music", "food"],
        "Garden Bar",
        "Galle Face, Colombo",
        "Rs 2,500",
        0,
        10,
        "event17.webp",
    ),
    (
        "Afro Pop Afterparty",
        "The DJ keeps the Afrobeat groove going past midnight.",
        "Charuki C.",
        "music",
        ["music", "dance"],
        "The Cellar",
        "Galle Face, Colombo",
        "Rs 1,500",
        3,
        22,
        "event1.webp",
    ),
    (
        "Vinyl Listening Session",
        "Bring a record, spin a story, listen with strangers.",
        "Sound Archive",
        "music",
        ["music", "reading"],
        "Old Town Studio",
        "Colombo",
        "Rs 800",
        7,
        18,
        "event2.webp",
    ),
    (
        "Backend Builds Cafe",
        "Brown-bag lunch, whiteboard talks, long-lived threads.",
        "Innovation Hub",
        "tech",
        ["tech", "design"],
        "Hub Space",
        "Colombo",
        "Free",
        0,
        12,
        "event3.webp",
    ),
    (
        "Indie Game Jams",
        "Weekend sprint to ship one tiny playable game.",
        "Game Bloc",
        "tech",
        ["gaming", "tech"],
        "Echelon Arena",
        "Kandy",
        "Rs 5,000",
        6,
        9,
        "event4.webp",
    ),
    (
        "AI Studio Hours",
        "Open lab: fine-tune, test, break, and retry models.",
        "DevFest Lanka",
        "tech",
        ["tech", "startups"],
        "Cinnamon Grand",
        "Colombo 03",
        "Rs 2,000",
        9,
        10,
        "event5.webp",
    ),
    (
        "Night T20 Tournament",
        "Floodlit cricket, loud stands, local derby energy.",
        "City Strikers",
        "sports",
        ["sports", "gaming"],
        "Oval Grounds",
        "Colombo",
        "Rs 1,000",
        2,
        18,
        "event6.webp",
    ),
    (
        "Trail Run Challenge",
        "Scrambles, river crossings, and a finisher medal.",
        "Run Club",
        "sports",
        ["fitness", "sports"],
        "Beach Road",
        "Mount Lavinia",
        "Rs 1,500",
        8,
        6,
        "event7.webp",
    ),
    (
        "Iron Yoga & Brews",
        "Sunrise flexibility, then a cold-brew hang.",
        "Flow Studio",
        "sports",
        ["fitness", "wellness"],
        "Sky Lounge",
        "Colombo",
        "Rs 1,200",
        11,
        7,
        "event8.webp",
    ),
    (
        "Clay & Coffee",
        "Wheel-throwing workshop with a stoneware gallery.",
        "Paper & Press",
        "art",
        ["art", "design"],
        "Old Town Studio",
        "Colombo",
        "Rs 2,200",
        0,
        14,
        "event9.webp",
    ),
    (
        "Silk Screen Saturdays",
        "Pull limited-edition prints by hand.",
        "Print Social",
        "art",
        ["art", "reading"],
        "Hub Space",
        "Colombo",
        "Rs 1,800",
        5,
        11,
        "event10.webp",
    ),
    (
        "Zine Fair",
        "Risky, radical, and self-published pages everywhere.",
        "The Reading Room",
        "art",
        ["reading", "art"],
        "Barefoot Cafe",
        "Colombo",
        "Rs 900",
        10,
        12,
        "event11.webp",
    ),
    (
        "Chocolate & Wine Pairing",
        "Single-origin bars meeting a flight of reds.",
        "Gourmet Collective",
        "food",
        ["food", "wine"],
        "Cinnamon Grand",
        "Colombo 03",
        "Rs 2,800",
        0,
        17,
        "event12.webp",
    ),
    (
        "Ramen Night Market",
        "Midnight bowls, charcoal grills, cash only.",
        "City Eats",
        "food",
        ["food", "photography"],
        "Havelock Town",
        "Colombo",
        "Rs 1,000",
        4,
        21,
        "event13.webp",
    ),
    (
        "Sci-Fi Double Feature",
        "Two cult classics back to back on 35mm.",
        "CineClub",
        "movies",
        ["movies", "cinema"],
        "Regal Theatre",
        "Colombo",
        "Rs 2,000",
        0,
        20,
        "event14.webp",
    ),
    (
        "Producers Circle Screening",
        "Early cut, live feedback, snacks at the back.",
        "CineClub",
        "movies",
        ["movies", "tech"],
        "Chaplin Cinemas",
        "Bambalapitiya, Colombo 04",
        "Rs 3,500",
        12,
        19,
        "event15.webp",
    ),
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

    users = session.exec(select(User)).all()
    usernames = {u.username: u.id for u in users}
    # Events hosted by a demo account reuse that user's uploaded profile
    # picture; real venues (The Velvet Room, Run Club, ...) keep a placeholder.
    host_avatars = {
        (u.display_name or u.username).split(" ", 1)[0].lower(): u.avatar_url
        for u in users
        if u.avatar_url
    }
    event_ids = []
    base = datetime.now(UTC)
    for index in range(len(EVENTS)):
        title, description, host, category, tags, venue, location, price, days, hours, image = EVENTS[index]
        event = Event(
            title=title,
            description=description,
            image_url=f"/uploads/event/{image}",
            host_name=host,
            host_avatar_url=host_avatars.get(
                host.split(" ", 1)[0].lower()
            ) or f"https://picsum.photos/seed/host{index + 1}/50/50",
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

# Quest catalog. Position in this list is the quest's sort_order and its slot in
# the user's badge deck. Each entry: (key, name, description, category, tiers),
# tiers: (name, target, unit, xp). Progress is counted server-side by record().
QUESTS = [
    (
        "social_network",
        "Social Network",
        "Connect with people and grow your circle.",
        "social",
        [("1 Friend", 1, "friends", 30), ("3 Friends", 3, "friends", 60), ("10 Friends", 10, "friends", 120)],
    ),
    (
        "matchmaker",
        "Matchmaker",
        "Refer friends to each other and watch them connect.",
        "social",
        [("1 Referral", 1, "referrals", 50), ("3 Referrals", 3, "referrals", 100)],
    ),
    (
        "squad_up",
        "Squad Up",
        "Start a group chat with your connections.",
        "social",
        [("1 Group", 1, "groups", 40)],
    ),
    (
        "explorer",
        "Explorer",
        "Mark the events you are going to.",
        "events",
        [("1 Event", 1, "events", 20), ("3 Events", 3, "events", 50), ("10 Events", 10, "events", 100)],
    ),
    (
        "ticket_holder",
        "Ticket Holder",
        "Buy tickets to events.",
        "events",
        [("1 Ticket", 1, "tickets", 40), ("5 Tickets", 5, "tickets", 100)],
    ),
    (
        "ticket_sharing",
        "Ticket Sharing",
        "Share your tickets with friends.",
        "events",
        [("1 Share", 1, "shares", 40), ("3 Shares", 3, "shares", 80)],
    ),
    (
        "gift_giver",
        "Gift Giver",
        "Gift a ticket to a connection.",
        "events",
        [("1 Gift", 1, "gifts", 50), ("3 Gifts", 3, "gifts", 100)],
    ),
    (
        "daily_streak",
        "Daily Streak",
        "Open Wuzy every day to keep your streak alive.",
        "habits",
        [("1 Day", 1, "days", 20), ("7 Days", 7, "days", 80), ("30 Days", 30, "days", 200)],
    ),
    (
        "complete_profile",
        "Complete Profile",
        "Add a name, bio, photo and hobbies.",
        "habits",
        [("Profile", 1, "profile", 100)],
    ),
]

# Demo counters applied once per existing account on a fresh seed, so a
# claimable card is there to try. (key, tier index, current_progress)
QUEST_START_PROGRESS = [
    ("social_network", 0, 1),
    ("explorer", 0, 1),
    ("complete_profile", 0, 1),
]


def seed_quests(session: Session) -> None:
    """Sync the quest catalog by key. Tiers match by position so live progress survives."""
    wanted = {quest[0] for quest in QUESTS}
    for stale in session.exec(select(Quest)).all():
        if stale.key in wanted:
            continue
        for tier in session.exec(select(QuestSubtask).where(QuestSubtask.quest_id == stale.id)).all():
            session.exec(delete(QuestSubtaskProgress).where(QuestSubtaskProgress.subtask_id == tier.id))
            session.delete(tier)
        # No ORM relationship links tiers to their quest, so flush the children first.
        session.flush()
        session.delete(stale)
    session.commit()

    for index, (key, name, description, category, tiers) in enumerate(QUESTS):
        quest = session.exec(select(Quest).where(Quest.key == key)).first()
        if quest is None:
            quest = Quest(key=key, name=name, description=description, category=category, sort_order=index)
        else:
            quest.name = name
            quest.description = description
            quest.category = category
            quest.sort_order = index
        session.add(quest)
        session.commit()
        session.refresh(quest)

        existing = {
            tier.sort_order: tier
            for tier in session.exec(select(QuestSubtask).where(QuestSubtask.quest_id == quest.id)).all()
        }
        for position, stale in existing.items():
            if position >= len(tiers):
                session.exec(delete(QuestSubtaskProgress).where(QuestSubtaskProgress.subtask_id == stale.id))
                session.delete(stale)
        for position, (tier_name, target, unit, xp) in enumerate(tiers):
            tier = existing.get(position) or QuestSubtask(quest_id=quest.id, sort_order=position)
            tier.name = tier_name
            tier.description = f"{tier_name} in {name}"
            tier.target_count = target
            tier.progress_unit = unit
            tier.reward_xp = xp
            tier.reward_sticker = position == len(tiers) - 1
            session.add(tier)
    session.commit()


def seed_quest_progress(session: Session) -> None:
    """Give every account the demo counters, only where no row exists yet."""
    users = session.exec(select(User)).all()
    for key, position, current in QUEST_START_PROGRESS:
        tier = session.exec(
            select(QuestSubtask)
            .join(Quest, Quest.id == QuestSubtask.quest_id)
            .where(Quest.key == key, QuestSubtask.sort_order == position)
        ).first()
        if tier is None:
            continue
        for user in users:
            exists = session.exec(
                select(QuestSubtaskProgress).where(
                    QuestSubtaskProgress.subtask_id == tier.id,
                    QuestSubtaskProgress.user_id == user.id,
                )
            ).first()
            if exists is None:
                session.add(
                    QuestSubtaskProgress(user_id=user.id, subtask_id=tier.id, current_progress=current)
                )
    session.commit()


def seed_tickets(session: Session) -> None:
    """Give every account one demo ticket if it has none."""
    for user in session.exec(select(User)).all():
        if session.exec(select(Ticket).where(Ticket.user_id == user.id)).first() is None:
            session.add(Ticket(user_id=user.id, ticket_type="standard"))
    session.commit()


def _run_ticket_seed() -> None:
    """Seed demo tickets when users exist."""
    with Session(engine) as session:
        if session.exec(select(func.count(User.id))).one() > 0:
            seed_tickets(session)


seed_tickets_if_present = _run_ticket_seed


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
