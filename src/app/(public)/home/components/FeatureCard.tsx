import React from "react";
import {Box, Card, Stack, Text, Title} from "@mantine/core";

const PRIMARY_COLOR = '#6B9ADF';
const ACCENT_BG_COLOR = 'rgba(0,0,0, 0.2)';
const BORDER_COLOR = 'rgba(107, 154, 223, 0.3)';

interface FeatureCardProps {
    icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <Card
            shadow="sm"
            padding="xl"
            radius="xl"
            withBorder
            h="100%"
            style={{
                border: `1px solid ${BORDER_COLOR}`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                background: 'white',
                overflow: 'hidden',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${BORDER_COLOR}`;
                e.currentTarget.style.borderColor = 'transparent';
                const bg = e.currentTarget.querySelector('.card-bg') as HTMLElement;
                if (bg) bg.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = BORDER_COLOR;
                const bg = e.currentTarget.querySelector('.card-bg') as HTMLElement;
                if (bg) bg.style.opacity = '0';
            }}
        >
            <Box
                className="card-bg"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: ACCENT_BG_COLOR,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    zIndex: 0,
                }}
            />

            <Stack gap="lg" align="center" ta="center" style={{ position: 'relative', zIndex: 1 }}>
                <Box
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: ACCENT_BG_COLOR,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <Icon size={36} color={PRIMARY_COLOR} stroke={1.5} />
                </Box>
                <Title order={3} size="h4" fw={700} style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {title}
                </Title>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                    {description}
                </Text>
            </Stack>
        </Card>
    );
}