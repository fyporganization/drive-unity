'use client';

import { useState } from 'react';
import {
    Container,
    Group,
    Burger,
    Drawer,
    Stack,
    Button,
    Text,
    Box
} from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import Link from 'next/link';
import { IconSparkles } from '@tabler/icons-react';

const PRIMARY_COLOR = '#6B9ADF';
const ACCENT_BG_COLOR = 'rgba(0,0,0, 0.2)';
const BORDER_COLOR = 'rgba(107, 154, 223, 0.3)';

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/price' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
];

export default function PublicNavbar() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [scroll] = useWindowScroll();
    const scrolled = scroll.y > 20;

    return (
        <>
            <Box
                component="header"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: scrolled
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: scrolled
                        ? `1px solid ${BORDER_COLOR}`
                        : '1px solid transparent',
                    boxShadow: scrolled
                        ? `0 4px 24px ${BORDER_COLOR}`
                        : 'none',
                }}
            >
                <Container size="xl">
                    <Group h={70} justify="space-between">
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Group gap="xs" style={{ cursor: 'pointer' }}>
                                <Box
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '12px',
                                        background: PRIMARY_COLOR,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 4px 16px ${BORDER_COLOR}`,
                                        animation: 'floating 3s ease-in-out infinite',
                                    }}
                                >
                                    <IconSparkles size={24} color="white" stroke={2.5} />
                                </Box>
                                <Text
                                    fw={800}
                                    size="xl"
                                    style={{
                                        color: PRIMARY_COLOR,
                                        fontFamily: "'Outfit', sans-serif",
                                        letterSpacing: '-0.5px',
                                    }}
                                >
                                    DriveUnity
                                </Text>
                            </Group>
                        </Link>

                        <Group gap="lg" visibleFrom="sm">
                            {navItems.map((item, index) => (
                                <Text
                                    key={item.href}
                                    component={Link}
                                    href={item.href}
                                    fw={500}
                                    size="sm"
                                    style={{
                                        color: 'var(--text-primary)',
                                        textDecoration: 'none',
                                        position: 'relative',
                                        transition: 'color 0.3s ease',
                                        cursor: 'pointer',
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                    className="nav-link"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = PRIMARY_COLOR;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                >
                                    {item.label}
                                </Text>
                            ))}

                            <Button
                                component={Link}
                                href="/auth"
                                size="md"
                                radius="xl"
                                style={{
                                    background: PRIMARY_COLOR,
                                    border: 'none',
                                    boxShadow: `0 4px 16px ${BORDER_COLOR}`,
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 6px 24px ${BORDER_COLOR}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = `0 4px 16px ${BORDER_COLOR}`;
                                }}
                            >
                                Sign In
                            </Button>
                        </Group>

                        <Box
                            hiddenFrom="sm"
                            style={{
                                padding: '8px',
                                borderRadius: '12px',
                                background: PRIMARY_COLOR,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: `0 4px 12px ${BORDER_COLOR}`,
                                transition: 'transform 0.2s ease',
                            }}
                            onClick={toggle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                size="sm"
                                color="white"
                            />
                        </Box>
                    </Group>
                </Container>
            </Box>

            <Drawer
                opened={opened}
                onClose={close}
                padding="xl"
                size="sm"
                position="right"
                hiddenFrom="sm"
            >
                <Stack gap="md">
                    <Group gap="xs" mb="lg">
                        <Box
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: PRIMARY_COLOR,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 16px ${BORDER_COLOR}`,
                            }}
                        >
                            <IconSparkles size={20} color="white" stroke={2.5} />
                        </Box>
                        <Text
                            fw={800}
                            size="lg"
                            style={{
                                color: PRIMARY_COLOR,
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        >
                            DriveUnity
                        </Text>
                    </Group>

                    {navItems.map((item, index) => (
                        <Box
                            key={item.href}
                            component={Link}
                            href={item.href}
                            onClick={close}
                            style={{
                                textDecoration: 'none',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                background: 'white',
                                border: `1px solid ${BORDER_COLOR}`,
                                boxShadow: `0 2px 8px ${BORDER_COLOR}`,
                                transition: 'all 0.3s ease',
                                animationDelay: `${index * 0.1}s`,
                            }}
                            className="fade-in"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(4px)';
                                e.currentTarget.style.boxShadow = `0 4px 16px ${BORDER_COLOR}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.boxShadow = `0 2px 8px ${BORDER_COLOR}`;
                            }}
                        >
                            <Text fw={500} c="var(--text-primary)">
                                {item.label}
                            </Text>
                        </Box>
                    ))}

                    <Button
                        component={Link}
                        href="/auth"
                        fullWidth
                        size="lg"
                        radius="xl"
                        mt="md"
                        style={{
                            background: PRIMARY_COLOR,
                            border: 'none',
                            boxShadow: `0 4px 16px ${BORDER_COLOR}`,
                            fontWeight: 600,
                        }}
                    >
                        Sign In
                    </Button>
                </Stack>
            </Drawer>

            <style jsx global>{`
                @keyframes floating {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-6px);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}