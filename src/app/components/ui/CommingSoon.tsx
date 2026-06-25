import React from 'react';
import { Container, Title, Text, Stack, Box } from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';

export default function ComingSoonPage() {
    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(107, 154, 223, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }}
            />
            <Box
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(107, 154, 223, 0.08)',
                    borderRadius: '50%',
                    filter: 'blur(80px)'
                }}
            />

            <Container size="sm" style={{ position: 'relative', zIndex: 1 }}>
                <Stack align="center" gap="xl">
                    <Box
                        style={{
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}
                    >
                        <IconRocket size={50} color="#6B9ADF" />
                    </Box>

                    <Title
                        order={1}
                        style={{
                            fontSize: '4rem',
                            fontWeight: 800,
                            color: '#6B9ADF',
                            textAlign: 'center',
                            letterSpacing: '-2px',
                            textShadow: '0 4px 20px rgba(107, 154, 223, 0.2)'
                        }}
                    >
                        Coming Soon
                    </Title>

                    <Text
                        size="xl"
                        style={{
                            color: '#718096',
                            textAlign: 'center',
                            maxWidth: '600px',
                            lineHeight: 1.6
                        }}
                    >
                        We're working on something amazing. Stay tuned!
                    </Text>
                </Stack>
            </Container>
        </Box>
    );
}